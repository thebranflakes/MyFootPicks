from pydantic import BaseModel
from typing import Optional

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

class PickBase(BaseModel):
    year: int
    week: int
    team_id: int
    pick_number: int

class PickCreate(PickBase):
    pass

class Pick(PickBase):
    id: int
    correct: Optional[bool] = None
    status: Optional[bool] = None
    user_id: int
    team_name: Optional[str] = None

    class Config:
        from_attributes = True

class ChatMessageBase(BaseModel):
    message: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: int
    user_id: int
    timestamp: str
    favorite_color: Optional[str] = None
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

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

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
