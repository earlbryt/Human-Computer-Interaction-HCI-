import asyncio
import json
from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import AgentServer,AgentSession, Agent, room_io, RoomOutputOptions
from livekit.plugins import noise_cancellation, silero, anam
from livekit.plugins.turn_detector.multilingual import MultilingualModel

server = AgentServer()

load_dotenv(".env.local")

class Assistant(Agent):
    def __init__(self, disease_context: dict | None = None) -> None:
        self.disease_context = disease_context
        super().__init__(
            instructions = """You are an experienced agricultural expert specializing in crop management, soil health, pest control, and sustainable farming practices.
            You eagerly assist farmers with their questions by providing practical, science-backed information from your extensive agricultural knowledge.
            Your responses are concise, clear, and actionable.
            Format your responses for natural speech. Avoid complex punctuation, symbols, or formatting such as emojis, asterisks, parentheses, or excessive commas.
            Write in complete, flowing sentences that sound natural when spoken aloud.
            Speak warmly and respectfully to farmers, making them feel valued and understood.
            Focus on being easily understandable and conversational, as your output will be read aloud by a text-to-speech system.""",
        )

    async def on_enter(self) -> None:
        await asyncio.sleep(1.0)
        if isinstance(self.disease_context, dict):
            cls = str(self.disease_context.get("className", "")).strip()
            conf = float(self.disease_context.get("confidence", 0)) * (100.0 if self.disease_context.get("confidence", 0) <= 1 else 1)
            is_healthy = self.disease_context.get("isHealthy", None)
            if is_healthy is True:
                greeting = f"The cocoa leaf appears healthy with {conf:.0f}% confidence. Give 2 short tips to keep it healthy."
            elif is_healthy is False:
                disease = cls or "a disease"
                greeting = f"{disease} was detected with {conf:.0f}% confidence. Provide 2-3 immediate, practical treatment steps."
            else:
                greeting = "The analysis was inconclusive. Ask them to retake the photo with better lighting and framing."
        else:
            greeting = "Greet the farmer and ask how you can assist with their plants today."
        await self.session.generate_reply(instructions=greeting)

server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    await ctx.connect(auto_subscribe=agents.AutoSubscribe.AUDIO_ONLY)
    disease_context = None
    try:
        participant = await asyncio.wait_for(ctx.wait_for_participant(), timeout=30.0)
        if getattr(participant, "metadata", None):
            try:
                disease_context = json.loads(participant.metadata)
            except Exception:
                disease_context = None
    except asyncio.TimeoutError:
        disease_context = None

    session = AgentSession(
        stt="assemblyai/universal-streaming:en",
        llm="openai/gpt-4.1-mini",
        tts="cartesia/sonic-3:93f08a8e-6087-414f-bc1c-c7430afe2ccc",
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )

    avatar = anam.AvatarSession(
      persona_config=anam.PersonaConfig(
         name="Anne",
         avatarId="27e12daa-50fc-4384-93c2-ebca73f1f78d",
      ),
   )

    try:
        await avatar.start(session, room=ctx.room)
    except Exception:
        pass

    await session.start(
        room=ctx.room,
        agent=Assistant(disease_context=disease_context),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
            ),
        ),
    )

if __name__ == "__main__":
    agents.cli.run_app(server)
