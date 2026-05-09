from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from models.user import User          # noqa: E402, F401
from models.document import Document  # noqa: E402, F401
from models.quiz import Quiz          # noqa: E402, F401
from models.question import Question  # noqa: E402, F401
from models.attempt import Attempt    # noqa: E402, F401
