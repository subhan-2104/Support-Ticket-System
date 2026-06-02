from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from database import engine
from database import SessionLocal

import models
import schemas

from datetime import datetime

app = FastAPI(title="Customer Support System")

models.Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@app.get("/")
def home():
    return {
        "message": "Support Ticket System API is running successfully"
    }
        
@app.post("/api/tickets")
def create_ticket(ticket: schemas.TicketCreate):

    db = SessionLocal()

    count = db.query(models.Ticket).count()

    ticket_number = count + 1

    ticket_id = f"TKT-{ticket_number:03d}"

    now = datetime.now()

    new_ticket = models.Ticket(
        ticket_id=ticket_id,
        customer_name=ticket.customer_name,
        customer_email=ticket.customer_email,
        subject=ticket.subject,
        description=ticket.description,
        status="Open",
        created_at=now,
        updated_at=now
    )

    db.add(new_ticket)

    db.commit()

    db.refresh(new_ticket)

    db.close()

    return {
        "ticket_id": ticket_id,
        "created_at": now
    }
    
@app.get("/api/tickets")
def get_tickets(
    status: str = None,
    search: str = None
):

    db = SessionLocal()

    query = db.query(models.Ticket)

    if status:
        query = query.filter(
            models.Ticket.status == status
        )

    if search:
        query = query.filter(
            (models.Ticket.ticket_id.contains(search))
            |
            (models.Ticket.customer_name.contains(search))
            |
            (models.Ticket.customer_email.contains(search))
            |
            (models.Ticket.subject.contains(search))
            |
            (models.Ticket.description.contains(search))
        )

    tickets = query.all()

    db.close()

    return tickets

@app.get("/api/tickets/{ticket_id}")
def get_ticket(ticket_id: str):

    db = SessionLocal()

    ticket = db.query(
        models.Ticket
    ).filter(
        models.Ticket.ticket_id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    notes = []

    for note in ticket.notes:
        notes.append({
            "text": note.note_text,
            "created_at": note.created_at
        })

    db.close()

    return {
        "ticket_id": ticket.ticket_id,
        "customer_name": ticket.customer_name,
        "customer_email": ticket.customer_email,
        "subject": ticket.subject,
        "description": ticket.description,
        "status": ticket.status,
        "notes": notes
    }
    
@app.put("/api/tickets/{ticket_id}")
def update_ticket(
    ticket_id: str,
    update: schemas.TicketUpdate
):

    db = SessionLocal()

    ticket = db.query(
        models.Ticket
    ).filter(
        models.Ticket.ticket_id == ticket_id
    ).first()

    if not ticket:
        raise HTTPException(
            status_code=404,
            detail="Ticket not found"
        )

    ticket.status = update.status

    ticket.updated_at = datetime.now()

    if update.note:

        note = models.Note(
            ticket_id=ticket.id,
            note_text=update.note,
            created_at=datetime.now()
        )

        db.add(note)

    db.commit()

    db.close()

    return {
        "success": True,
        "updated_at": datetime.now()
    }