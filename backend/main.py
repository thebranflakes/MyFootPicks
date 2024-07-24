import os
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from database import engine, get_db
from models import Base, User
from schemas import UserCreate, Token, User, PickCreate, Pick, ChatMessageCreate, ChatMessage, TeamCreate, Team
from auth import authenticate_user, create_access_token, get_current_user
import crud
from dotenv import load_dotenv

load_dotenv()  # Ensure .env file is loaded

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost:3000",
    "http://localhost:4000",
    # Add other origins if needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/users/", response_model=User)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.post("/picks/", response_model=Pick)
def create_pick(pick: PickCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.create_pick(db=db, pick=pick, user_id=current_user.id)

@app.get("/picks/", response_model=list[Pick])
def get_picks(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    picks = crud.get_picks(db=db, user_id=current_user.id)
    return [
        Pick(
            id=pick.Pick.id,
            year=pick.Pick.year,
            week=pick.Pick.week,
            team_id=pick.Pick.team_id,
            pick_number=pick.Pick.pick_number,
            correct=pick.Pick.correct,
            status=pick.Pick.status,
            user_id=pick.Pick.user_id,
            team_name=pick.Team.display_name  # Use the display_name from the Team table
        )
        for pick in picks
    ]

@app.post("/teams/", response_model=Team)
def create_team(team: TeamCreate, db: Session = Depends(get_db)):
    return crud.create_team(db=db, team=team)

@app.get("/teams/", response_model=list[Team])
def get_teams(db: Session = Depends(get_db)):
    return crud.get_teams(db=db)

@app.post("/chat_messages/", response_model=ChatMessage)
def create_chat_message(chat_message: ChatMessageCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    chat_message.userId = current_user.id
    return crud.create_chat_message(db=db, chat_message=chat_message)

@app.get("/chat_messages/", response_model=list[ChatMessage])
def get_chat_messages(db: Session = Depends(get_db)):
    return crud.get_chat_messages(db=db)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
