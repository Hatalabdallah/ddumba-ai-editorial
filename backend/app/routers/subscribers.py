from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from backend.app.database import get_db, Subscriber as SubscriberDB
from backend.app.models import SubscriberCreate, SubscriberResponse
from backend.app.mailer import send_welcome_email

router = APIRouter()

@router.get("/", response_model=list[SubscriberResponse])
def get_all_subscribers(db: Session = Depends(get_db)):
    return db.query(SubscriberDB).order_by(SubscriberDB.created_at.desc()).all()

@router.post("/", response_model=SubscriberResponse, status_code=status.HTTP_201_CREATED)
def subscribe(data: SubscriberCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email_clean = data.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Invalid email address format")
        
    existing = db.query(SubscriberDB).filter(SubscriberDB.email == email_clean).first()
    if existing:
        raise HTTPException(status_code=400, detail="You are already subscribed to the newsletter!")
        
    new_sub = SubscriberDB(email=email_clean)
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    
    background_tasks.add_task(send_welcome_email, new_sub.email)
    
    return new_sub