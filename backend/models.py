from sqlalchemy import Column, Integer, Boolean, String, ForeignKey, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)  # Use 'password' as per your database
    venmo = Column(String, nullable=True)
    favorite_color = Column(String, nullable=True)
    favorite_team = Column(String, nullable=True)
    paid = Column(Boolean, default=False)
    secret = Column(String, nullable=True)
    sendto = Column(String, nullable=True)

class Pick(Base):
    __tablename__ = "picks"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    year = Column(Integer)
    week = Column(Integer)
    team_id = Column(Integer)
    pick_number = Column(Integer)
    correct = Column(Integer)
    status = Column(Integer)
    user = relationship("User", back_populates="picks")

class Team(Base):
    __tablename__ = "team"
    team_id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String)
    abbreviation = Column(String)
    display_name = Column(String)
    image_url = Column(String)

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("user.id"), nullable=True)
    username = Column(String, nullable=True)
    message = Column(Text, nullable=True)
    timestamp = Column(DateTime, nullable=True)
    favoriteColor = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    user = relationship("User", back_populates="chat_messages")

User.picks = relationship("Pick", order_by=Pick.id, back_populates="user")
User.chat_messages = relationship("ChatMessage", order_by=ChatMessage.id, back_populates="user")
