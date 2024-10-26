import os
import logging
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload
from fastapi.security import OAuth2PasswordRequestForm
from database import engine, get_db
from models import Base, User as UserModel, Pick as PickModel, Team as TeamModel  # Correct model usage
from schemas import UserCreate, Token, User as UserSchema, PickCreate, Pick as PickSchema, ChatMessageCreate, ChatMessage, TeamCreate, Team, PickSummary, UserUpdate
from auth import authenticate_user, create_access_token, get_current_user
import crud
import requests
from dotenv import load_dotenv
from typing import Optional, List
from config import YEAR, CURRENT_WEEK

logging.basicConfig(level=logging.INFO)
logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

load_dotenv()  # Ensure .env file is loaded

Base.metadata.create_all(bind=engine)

app = FastAPI()

# Add CORS middleware
origins = [
    "http://localhost:3000",
    "http://localhost:4000",
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

@app.post("/logout")
async def logout(current_user: UserSchema = Depends(get_current_user)):
    response = JSONResponse(content={"message": "Successfully logged out"})
    response.delete_cookie(key="Authorization")
    return response

@app.post("/users/", response_model=UserSchema)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/me", response_model=UserSchema)
def read_users_me(current_user: UserSchema = Depends(get_current_user)):
    return current_user

@app.put("/users/me")
def update_user_me(
    user_update: UserUpdate, 
    db: Session = Depends(get_db), 
    current_user: UserSchema = Depends(get_current_user)
):
    user = crud.get_user(db=db, user_id=current_user.id)
    if user_update.favorite_team:
        user.favorite_team = user_update.favorite_team
    if user_update.favorite_color:
        user.favorite_color = user_update.favorite_color
    db.commit()
    db.refresh(user)
    return user

@app.get("/picks", response_model=List[PickSchema])
def get_picks(db: Session = Depends(get_db), current_user: UserSchema = Depends(get_current_user)):
    try:
        picks = crud.get_picks(db=db, user_id=current_user.id)
        logging.info(f"Fetched picks for user {current_user.id}: {picks}")
        return [
            PickSchema(
                id=pick.Pick.id,
                year=pick.Pick.year,
                week=pick.Pick.week,
                team_id=pick.Pick.team_id,
                pick_number=pick.Pick.pick_number,
                correct=pick.Pick.correct,
                status=pick.Pick.status,
                user_id=pick.Pick.user_id,
                team_name=pick.Team.display_name,  # Use display_name from Team
                abbreviation=pick.Team.abbreviation
            )
            for pick in picks
        ]
    except Exception as e:
        logging.error(f"Error fetching picks for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve picks")

@app.post("/picks", response_model=PickSchema)
def submit_pick(pick: PickCreate, db: Session = Depends(get_db), current_user: UserSchema = Depends(get_current_user)):
    try:
        logging.info(f"Pick Data Received: {pick.model_dump()}")  # This will log the pick data

        # Use the ORM model `Pick` here instead of `PickSchema`
        new_pick = PickModel(
            user_id=current_user.id,  # Set user_id here
            year=pick.year,
            week=pick.week,
            team_id=pick.team_id,
            pick_number=pick.pick_number,
            correct=None,  # Defaults to None
            status=0  # Defaults to 0 (e.g., not started)
        )
        
        db.add(new_pick)
        db.commit()
        db.refresh(new_pick)
        logging.info(f"User {current_user.id} submitted pick {new_pick}")
        return new_pick
    except Exception as e:
        logging.error(f"Error submitting pick for user {current_user.id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to submit pick")

@app.delete("/picks/{pick_id}", response_model=PickSchema)
def delete_pick(pick_id: int, db: Session = Depends(get_db), current_user: UserSchema = Depends(get_current_user)):
    try:
        # Query the pick by id and user id to ensure the current user owns the pick
        pick = db.query(PickModel).filter(PickModel.id == pick_id, PickModel.user_id == current_user.id).first()

        if not pick:
            raise HTTPException(status_code=404, detail="Pick not found or unauthorized")

        # Delete the pick
        db.delete(pick)
        db.commit()

        return pick
    except Exception as e:
        logging.error(f"Error deleting pick for user {current_user.id}: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete pick")

@app.put("/picks/update_status/")
def update_picks_status(team_abbreviation: str, week: int, year: int, db: Session = Depends(get_db)):
    try:
        # Find all picks for the given team, week, and year
        team_id = db.query(TeamModel.id).filter(TeamModel.abbreviation == team_abbreviation).scalar()

        if not team_id:
            raise HTTPException(status_code=404, detail="Team not found")

        # Update the status of all picks for that team in the given week and year
        db.query(PickModel).filter(
            PickModel.team_id == team_id,
            PickModel.week == week,
            PickModel.year == year,
            PickModel.status == 0  # Only update picks that are still hidden (status = 0)
        ).update({PickModel.status: 1})

        db.commit()
        return {"message": "Pick statuses updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update picks status")
    
def fetch_games_from_espn(week_number):
    try:
        url = f"https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week={week_number}"
        response = requests.get(url)
        response.raise_for_status()  # This will raise an HTTPError if the response was an error
        data = response.json()
        
        # Extract relevant game information
        games = []
        for event in data.get('events', []):
            home_team = event['competitions'][0]['competitors'][0]['team']['abbreviation']
            away_team = event['competitions'][0]['competitors'][1]['team']['abbreviation']
            game_state = event['status']['type']['state']

            games.append({
                'homeTeam': home_team,
                'awayTeam': away_team,
                'status': game_state
            })

        logging.info(f"Fetched games for week {week_number}: {games}")
        return games

    except requests.RequestException as e:
        logging.error(f"Error fetching data from ESPN API: {e}")
        return []

def update_pick_statuses_for_week(week_number, year, db: Session):
    url = f"https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week={week_number}"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Log the response structure to confirm the format
        logging.info("Fetched games for week %s: %s", week_number, data)
        
        games = data.get("events", [])
        
        for game in games:
            game_state = game.get("status", {}).get("type", {}).get("state")
            competition = game.get("competitions", [{}])[0]
            home_team_info = competition["competitors"][0]
            away_team_info = competition["competitors"][1]

            home_team_abbr = home_team_info["team"]["abbreviation"]
            away_team_abbr = away_team_info["team"]["abbreviation"]

            logging.info("Processing game: %s vs %s, state: %s", home_team_abbr, away_team_abbr, game_state)

            # Fetch team IDs
            home_team_id = db.query(TeamModel).filter(TeamModel.abbreviation == home_team_abbr).first().team_id
            away_team_id = db.query(TeamModel).filter(TeamModel.abbreviation == away_team_abbr).first().team_id

            # Update status for non-pre games
            if game_state != "pre":
                db.query(PickModel).filter(
                    PickModel.year == year,
                    PickModel.week == week_number,
                    PickModel.team_id.in_([home_team_id, away_team_id])
                ).update({"status": 1})
                db.commit()

            # Process scores only if game is completed
            if game_state == "post":
                home_score = int(home_team_info.get("score", 0))
                away_score = int(away_team_info.get("score", 0))

                logging.info("Home Team: %s Score: %s, Away Team: %s Score: %s", home_team_abbr, home_score, away_team_abbr, away_score)

                if home_score == away_score:
                    # Update both teams' picks as ties (correct = 2)
                    db.query(PickModel).filter(
                        PickModel.year == year,
                        PickModel.week == week_number,
                        PickModel.team_id.in_([home_team_id, away_team_id])
                    ).update({"correct": 2})
                    db.commit()

                else:
                    # Determine the winner and loser
                    winning_team_id = home_team_id if home_score > away_score else away_team_id
                    losing_team_id = away_team_id if home_score > away_score else home_team_id

                    # Update the winner's picks as correct (correct = 1)
                    db.query(PickModel).filter(
                        PickModel.year == year,
                        PickModel.week == week_number,
                        PickModel.team_id == winning_team_id
                    ).update({"correct": 1})

                    # Update the loser's picks as incorrect (correct = 0)
                    db.query(PickModel).filter(
                        PickModel.year == year,
                        PickModel.week == week_number,
                        PickModel.team_id == losing_team_id
                    ).update({"correct": 0})
                    db.commit()

    except requests.RequestException as e:
        logging.error("Error fetching or processing games from ESPN API: %s", e)
        raise HTTPException(status_code=500, detail="Failed to fetch game data")


@app.get("/standings/")
def get_all_picks_for_standings(db: Session = Depends(get_db)):
    try:
        # logging.info(f"Fetching standings for current week {CURRENT_WEEK} and year {YEAR}")

        # Simulate updating the pick statuses for the current week
        logging.info(f"Attempting to update pick statuses for week {CURRENT_WEEK}")
        update_pick_statuses_for_week(CURRENT_WEEK, YEAR, db)  # Update picks for the current week

        users = db.query(UserModel).filter(UserModel.username != "test").all()

        standings = []
        for user in users:
            logging.info(f"Processing picks for user {user.username}")
            # Filter picks by user_id and the year 2024, join Team model to access the abbreviation
            user_picks = db.query(PickModel).options(joinedload(PickModel.team)).filter(
                PickModel.user_id == user.id,
                PickModel.year == YEAR  # Filter by the year from config
            ).all()
            logging.info(f"User {user.username} has {len(user_picks)} picks for the year {YEAR}")

            # Calculate wins, losses, ties
            wins = sum(pick.correct == 1 for pick in user_picks)
            losses = sum(pick.correct == 0 for pick in user_picks)
            ties = sum(pick.correct == 2 for pick in user_picks)

            standings.append({
                'username': user.username,
                'record': f"{wins} - {losses}" + (f" - {ties}" if ties > 0 else ""),  # Show ties only if greater than 0
                'picks': [
                    {
                        'week': pick.week,
                        'team_abbreviation': pick.team.abbreviation if pick.team else None,  # Show abbreviation
                        'status': pick.status,
                        'correct': pick.correct  # Ensure correct is sent here
                    }
                    for pick in user_picks
                ]
            })

        return standings

    except Exception as e:
        logging.error(f"Error in fetching standings: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/team/{abbreviation}")
def get_team_by_abbreviation(abbreviation: str, db: Session = Depends(get_db)):
    team = db.query(Team).filter(Team.abbreviation == abbreviation).first()
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")
    return {"team_id": team.team_id}

@app.get("/teams")
def get_teams(db: Session = Depends(get_db)):
    try:
        teams = db.query(TeamModel).all()
        return teams
    except Exception as e:
        logging.error(f"Error fetching teams: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat_messages/", response_model=ChatMessage)
def create_chat_message(chat_message: ChatMessageCreate, db: Session = Depends(get_db), current_user: UserSchema = Depends(get_current_user)):
    chat_message.userId = current_user.id
    return crud.create_chat_message(db=db, chat_message=chat_message)

@app.get("/chat_messages/", response_model=List[ChatMessage])
def get_chat_messages(db: Session = Depends(get_db)):
    return crud.get_chat_messages(db=db)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
