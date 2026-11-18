import sqlite3, json
from pathlib import Path
db = sqlite3.connect("db.sqlite3")
db.row_factory = sqlite3.Row
records = []
for row in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND (name LIKE 'academy_%' OR name='auth_user')"):
    name = row["name"]
    for item in db.execute('SELECT * FROM "' + name + '"'):
        value = dict(item)
        records.append({"model": name, "id": value.get("id", 0), "fields": value})
Path("data/legacy.json").write_text(json.dumps(records), encoding="utf-8")
print("Exported", len(records), "records to private migration input")
