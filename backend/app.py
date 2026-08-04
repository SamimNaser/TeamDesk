from flask import Flask, request
from flask_cors import CORS
from database import get_db_connection

from email_validator import validate_email, EmailNotValidError
import phonenumbers
from phonenumbers.phonenumberutil import NumberParseException

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:5174"])
# app.config['SECRET_KEY'] = 'sk samim naser'

EMPLOYEE_SELECT = """
    SELECT
        e.id,
        e.name,
        c.email,
        c.phone,
        e.department,
        e.position,
        e.salary,
        e.joining_date
    FROM employees e
    LEFT JOIN employee_contacts c ON c.employee_id = e.id
"""


def is_valid_email(email):
    try:
        # validate_email() returns validated email information when the
        # email is valid instead of directly returning True or False.
        validate_email(email, check_deliverability=False)
        return True
    except EmailNotValidError:
        # If the email is invalid, validate_email() raises
        # EmailNotValidError, so treat it as invalid and return False.
        return False


def is_valid_phone(phone):
    try:
        # parse() converts the input into a PhoneNumber object.
        # It may raise NumberParseException if the input cannot be parsed.
        parsed_phone = phonenumbers.parse(str(phone), "IN")

        # is_valid_number() already returns True or False depending on
        # whether the parsed phone number is considered a valid number.
        return phonenumbers.is_valid_number(parsed_phone)
    except NumberParseException:
        # If parsing fails, treat the phone number as invalid.
        return False


def upsert_employee_contact(cursor, employee_id, email=None, phone=None):
    cursor.execute(
        "SELECT id FROM employee_contacts WHERE employee_id = %s",
        (employee_id,),
    )
    contact = cursor.fetchone()

    if contact:
        updates = []
        values = []

        if email is not None:
            updates.append("email = %s")
            values.append(email)

        if phone is not None:
            updates.append("phone = %s")
            values.append(phone)

        if not updates:
            return False

        values.append(employee_id)
        cursor.execute(
            f"UPDATE employee_contacts SET {', '.join(updates)} WHERE employee_id = %s",
            tuple(values),
        )
    else:
        cursor.execute(
            """
            INSERT INTO employee_contacts (employee_id, email, phone)
            VALUES (%s, %s, %s)
            """,
            (employee_id, email, phone),
        )

    return True


@app.route("/")
def home():
    return {"message": "Employee Management API"}


# GET -- used to retrieve data
@app.route("/employees", methods=["GET"])
def get_employees():
    mydb = get_db_connection()
    cursor = mydb.cursor(dictionary=True)
    cursor.execute(f"{EMPLOYEE_SELECT} ORDER BY e.id")
    employees = cursor.fetchall()
    cursor.close()
    mydb.close()
    return employees


# GET -- used to retrieve a specific employee by ID
@app.route("/employees/<int:id>", methods=["GET"])  # type: ignore
def get_employee(id):
    mydb = get_db_connection()
    cursor = mydb.cursor(dictionary=True)
    cursor.execute(f"{EMPLOYEE_SELECT} WHERE e.id = %s", (id,))
    employee = cursor.fetchone()
    cursor.close()
    mydb.close()

    if employee is None:
        return {"message": f"Employee {id} not found"}, 404

    return employee


# POST -- used to create new data
@app.route("/employees", methods=["POST"])
def add_employee():
    data = request.get_json()
    mydb = get_db_connection()

    # Required fields
    name = data.get("name")
    email = data.get("email")

    if not name or not email:
        mydb.close()
        return {"message": "Name and email are required"}, 400

    if not is_valid_email(email):
        mydb.close()
        return {"message": "Invalid email address"}, 400

    cursor = mydb.cursor()
    cursor.execute("SELECT id FROM employee_contacts WHERE email = %s", (email,))
    existing_employee = cursor.fetchone()

    if existing_employee:
        cursor.close()
        mydb.close()
        return {"message": "An employee with this email already exists"}, 409

    # Optional fields
    phone = data.get("phone")
    if phone and not is_valid_phone(phone):
        cursor.close()
        mydb.close()
        return {"message": "Invalid phone number"}, 400
    department = data.get("department")
    position = data.get("position")
    salary = data.get("salary")
    joining_date = data.get("joining_date")

    try:
        cursor.execute(
            """
            INSERT INTO employees
            (name, department, position, salary, joining_date)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (name, department, position, salary, joining_date),
        )
        employee_id = cursor.lastrowid
        upsert_employee_contact(cursor, employee_id, email, phone)
        mydb.commit()
    except Exception:
        mydb.rollback()
        raise
    finally:
        cursor.close()
        mydb.close()

    return {"message": "Employee added successfully"}, 201


# PATCH -- used to partially update existing employee data
@app.route("/employees/<int:id>", methods=["PATCH"])
def update_employee(id):
    data = request.get_json()
    mydb = get_db_connection()

    cursor = mydb.cursor()
    cursor.execute("SELECT id FROM employees WHERE id = %s", (id,))
    employee = cursor.fetchone()

    if employee is None:
        cursor.close()
        mydb.close()
        return {"message": f"Employee {id} not found"}, 404

    if "email" in data and not is_valid_email(data["email"]):
        cursor.close()
        mydb.close()
        return {"message": "Invalid email address"}, 400

    if "email" in data:
        cursor.execute(
            """
            SELECT employee_id
            FROM employee_contacts
            WHERE email = %s AND employee_id != %s
            """,
            (data["email"], id),
        )
        existing_employee = cursor.fetchone()

        if existing_employee:
            cursor.close()
            mydb.close()
            return {"message": "An employee with this email already exists"}, 409

    if "phone" in data and data["phone"] and not is_valid_phone(data["phone"]):
        cursor.close()
        mydb.close()
        return {"message": "Invalid phone number"}, 400

    employee_fields = ["name", "department", "position", "salary", "joining_date"]
    updates = []
    values = []

    for field in employee_fields:
        if field in data:
            updates.append(f"{field} = %s")
            values.append(data[field])

    contact_changed = "email" in data or "phone" in data

    if not updates and not contact_changed:
        cursor.close()
        mydb.close()
        return {"message": "No valid fields provided"}, 400

    try:
        if updates:
            query = f"UPDATE employees SET {', '.join(updates)} WHERE id = %s"
            values.append(id)
            cursor.execute(query, tuple(values))

        if contact_changed:
            upsert_employee_contact(
                cursor,
                id,
                data.get("email") if "email" in data else None,
                data.get("phone") if "phone" in data else None,
            )

        mydb.commit()
    except Exception:
        mydb.rollback()
        raise
    finally:
        cursor.close()
        mydb.close()

    return {"message": f"Employee {id} updated"}


# DELETE -- removes an employee by ID
@app.route("/employees/<int:id>", methods=["DELETE"])
def delete_employee(id):
    mydb = get_db_connection()
    cursor = mydb.cursor()
    cursor.execute("SELECT id FROM employees WHERE id = %s", (id,))
    employee = cursor.fetchone()

    if employee is None:
        cursor.close()
        mydb.close()
        return {"message": f"Employee {id} not found"}, 404

    cursor.execute("DELETE FROM employee_contacts WHERE employee_id = %s", (id,))
    cursor.execute("DELETE FROM employees WHERE id = %s", (id,))
    mydb.commit()
    cursor.close()
    mydb.close()

    return {"message": f"Employee {id} deleted"}


if __name__ == "__main__":
    app.run(debug=True, port=5001)
