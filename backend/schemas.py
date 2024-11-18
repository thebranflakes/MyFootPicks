from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: str
    username: str

class UserCreate(UserBase):
    password: str
    venmo: Optional[str] = None
    favorite_color: Optional[str] = None
    favorite_team: Optional[str] = None

class User(UserBase):
    id: int
    venmo: Optional[str] = None
    favorite_color: Optional[str] = None
    favorite_team: Optional[str] = None
    paid: bool
    secret: Optional[str] = None
    sendto: Optional[str] = None

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    favorite_team: Optional[str] = None
    favorite_color: Optional[str] = None

    class Config:
        orm_mode = True


# Pick Schemas
class PickBase(BaseModel):
    year: int
    week: int
    team_id: int
    pick_number: int

class PickCreate(PickBase):
    year: int
    week: int
    team_id: int
    pick_number: int

class Pick(PickBase):
    id: int
    correct: Optional[int] = None
    status: Optional[int] = None
    user_id: int
    team_name: Optional[str] = None  # Display name of the team
    abbreviation: Optional[str] = None  # Team abbreviation

    class Config:
        from_attributes = True

class PickSummary(BaseModel):
    id: int
    correct: Optional[int] = None
    user_id: int
    team_name: Optional[str] = None

    class Config:
        from_attributes = True


# Chat Message Schemas
class ChatMessageSchema(BaseModel):
    id: int
    userId: Optional[int] = None
    username: str
    message: str
    timestamp: datetime
    favoriteColor: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        orm_mode = True

class ChatMessageCreate(BaseModel):
    message: str
    favoriteColor: Optional[str] = None
    image_url: Optional[str] = None


# Team Schemas
class TeamBase(BaseModel):
    team_name: str
    abbreviation: str
    display_name: str

class TeamCreate(TeamBase):
    image_url: Optional[str] = None

class Team(TeamBase):
    team_id: int
    image_url: Optional[str] = None

    class Config:
        from_attributes = True


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
