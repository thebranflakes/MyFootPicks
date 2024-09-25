from sqlalchemy import Column, Integer, Boolean, String, ForeignKey, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from database import Base

Base = declarative_base()

# User model
class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)  # Keep password storage safe, possibly hashed
    venmo = Column(String, nullable=True)
    favorite_color = Column(String, nullable=True)
    favorite_team = Column(String, nullable=True)
    paid = Column(Boolean, default=False)
    secret = Column(String, nullable=True)
    sendto = Column(String, nullable=True)

    # Relationships
    picks = relationship("Pick", order_by="Pick.id", back_populates="user")
    chat_messages = relationship("ChatMessage", order_by="ChatMessage.id", back_populates="user")

# Pick model
class Pick(Base):
    __tablename__ = "picks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"))
    year = Column(Integer)
    week = Column(Integer)
    team_id = Column(Integer, ForeignKey("team.team_id"))  # ForeignKey to Team model
    pick_number = Column(Integer)
    correct = Column(Integer)  # 1 for correct, 0 for incorrect
    status = Column(Integer)  # 0: Hidden, 1: Visible, etc.

    # Relationships
    user = relationship("User", back_populates="picks")
    team = relationship("Team", lazy="joined")  # Automatically join with Team when querying

# Team model
class Team(Base):
    __tablename__ = "team"

    team_id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String, nullable=False)  # Full team name
    abbreviation = Column(String, nullable=False)  # Shortened team name, e.g., "CIN" for Bengals
    display_name = Column(String, nullable=True)  # Display name (could be nickname)
    image_url = Column(String, nullable=True)  # URL for team image (optional)


# ChatMessage model
class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("user.id"), nullable=True)
    username = Column(String, nullable=True)  # Optional, but could use relationship to User
    message = Column(Text, nullable=True)
    timestamp = Column(DateTime, nullable=True)
    favoriteColor = Column(String, nullable=True)
    image_url = Column(String, nullable=True)

    # Relationship
    user = relationship("User", back_populates="chat_messages")

# Relationships setup
User.picks = relationship("Pick", order_by=Pick.id, back_populates="user")
User.chat_messages = relationship("ChatMessage", order_by=ChatMessage.id, back_populates="user")
