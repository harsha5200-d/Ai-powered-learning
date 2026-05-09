import sys
import os

# Add the directory to sys.path so we can import the app
sys.path.append(r'c:\Users\DELL\OneDrive\Antygravity\studyq-backend')

from app import app, db
from models.user import User
from models.document import Document
from models.quiz import Quiz
from models.question import Question
from models.attempt import Attempt

with app.app_context():
    models = [
        ("Users", User), 
        ("Documents", Document), 
        ("Quizzes", Quiz), 
        ("Questions", Question), 
        ("Attempts", Attempt)
    ]
    
    output_lines = ["# Database Dump", ""]
    
    for name, model in models:
        output_lines.append(f"## {name}")
        try:
            records = model.query.all()
            if not records:
                output_lines.append("*(No records found)*\n")
                continue
            
            # Get column names
            cols = [column.name for column in model.__table__.columns]
            
            # Formatting table
            header = "| " + " | ".join(cols) + " |"
            separator = "| " + " | ".join(["---"] * len(cols)) + " |"
            output_lines.append(header)
            output_lines.append(separator)
            
            for record in records:
                values = []
                for col in cols:
                    val = getattr(record, col)
                    val_str = str(val).replace('\n', ' ')
                    if len(val_str) > 50:
                        val_str = val_str[:47] + "..."
                    values.append(val_str)
                output_lines.append("| " + " | ".join(values) + " |")
            output_lines.append("\n")
            
        except Exception as e:
            output_lines.append(f"Error querying {name}: {e}\n")

    # Write to a markdown file
    with open(r'c:\Users\DELL\OneDrive\Antygravity\studyq-backend\db_dump.md', 'w', encoding='utf-8') as f:
        f.write("\n".join(output_lines))
        
    print("Database dumped successfully to db_dump.md")
