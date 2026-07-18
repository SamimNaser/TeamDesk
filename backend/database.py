import mysql.connector

def get_db_connection():
  return mysql.connector.connect(
    host="localhost",
    user="root",
    password="samimnaser07",
    database="employee_management"
  )