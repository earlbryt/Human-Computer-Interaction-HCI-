from dotenv import load_dotenv

from livekit import agents, rtc
from livekit.agents import AgentServer,AgentSession, Agent, room_io, RoomOutputOptions
from livekit.plugins import noise_cancellation, silero, anam
from livekit.plugins.turn_detector.multilingual import MultilingualModel

server = AgentServer()

load_dotenv(".env.local")

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(
            instructions = """You are an experienced agricultural expert specializing in crop management, soil health, pest control, and sustainable farming practices.
            You eagerly assist farmers with their questions by providing practical, science-backed information from your extensive agricultural knowledge.
            Your responses are concise, clear, and actionable.
            Format your responses for natural speech. Avoid complex punctuation, symbols, or formatting such as emojis, asterisks, parentheses, or excessive commas.
            Write in complete, flowing sentences that sound natural when spoken aloud.
            Speak warmly and respectfully to farmers, making them feel valued and understood.
            Focus on being easily understandable and conversational, as your output will be read aloud by a text-to-speech system.""",
        )

server = AgentServer()

@server.rtc_session()
async def my_agent(ctx: agents.JobContext):
    session = AgentSession(
        stt="assemblyai/universal-streaming:en",
        llm="openai/gpt-4.1-mini",
        tts="cartesia/sonic-3:9626c31c-bec5-4cca-baa8-f8ba9e84c8bc",
        vad=silero.VAD.load(),
        turn_detection=MultilingualModel(),
    )

    avatar = anam.AvatarSession(
      persona_config=anam.PersonaConfig(
         name="Cara",  # Name of the avatar to use.
         avatarId="960f614f-ea88-47c3-9883-f02094f70874",  # ID of the avatar to use. See "Avatar setup" for details.
      ),
   )

    await avatar.start(session, room=ctx.room)

    await session.start(
        room=ctx.room,
        agent=Assistant(),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: noise_cancellation.BVCTelephony() if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP else noise_cancellation.BVC(),
            ),
        ),
    )

    await session.generate_reply(
        instructions="""Greet the user and offer your assistance"""
    )


if __name__ == "__main__":
    agents.cli.run_app(server)