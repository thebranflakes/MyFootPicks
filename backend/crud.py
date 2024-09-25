from sqlalchemy.orm import Session
from models import User, Pick, ChatMessage, Team
from schemas import UserCreate, PickCreate, ChatMessageCreate, TeamCreate
from auth import get_password_hash
from models import Pick, Team, ChatMessage, User

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        venmo=user.venmo
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_pick(db: Session, pick: PickCreate, user_id: int):
    db_pick = Pick(**pick.model_dump(), user_id=user_id)
    db.add(db_pick)
    db.commit()
    db.refresh(db_pick)
    return db_pick

def get_picks(db: Session, user_id: int):
    return db.query(Pick, Team).join(Team, Pick.team_id == Team.team_id).filter(Pick.user_id == user_id).all()

def get_picks_by_year(db: Session, user_id: int, year: int):
    return db.query(Pick, Team).join(Team, Pick.team_id == Team.team_id).filter(
        Pick.user_id == user_id, Pick.year == year
    ).all()

def get_teams(db: Session):
    return db.query(Team).all()

def create_team(db: Session, team: TeamCreate):
    db_team = Team(**team.model_dump())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

def create_chat_message(db: Session, chat_message: ChatMessageCreate):
    db_chat_message = ChatMessage(**chat_message.model_dump())
    db.add(db_chat_message)
    db.commit()
    db.refresh(db_chat_message)
    return db_chat_message

def get_chat_messages(db: Session):
    return db.query(ChatMessage).all()
