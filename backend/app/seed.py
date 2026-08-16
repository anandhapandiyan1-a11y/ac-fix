from .database import SessionLocal, engine
from . import models
from .auth import hash_password


def seed():
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            print("DB already seeded - skipping.")
            return

        services = [
            models.Service(
                name="AC Installation",
                description="Complete split AC installation with piping, mounting and testing.",
                base_price=899,
                estimated_time="2–3 hrs",
                icon="🔧",
            ),
            models.Service(
                name="AC Repair",
                description="On-site diagnosis and repair of cooling, power and wiring faults.",
                base_price=499,
                estimated_time="1–2 hrs",
                icon="🛠️",
            ),
            models.Service(
                name="AC Service & Deep Cleaning",
                description="Indoor unit, filter and coil cleaning with blower maintenance.",
                base_price=399,
                estimated_time="1 hr",
                icon="🧼",
            ),
            models.Service(
                name="Gas Top-up / Refrigerant Recharge",
                description="Leak check and R32/R410A refrigerant recharge to restore cooling.",
                base_price=749,
                estimated_time="1–2 hrs",
                icon="💨",
            ),
            models.Service(
                name="AC Not Cooling / Compressor Check",
                description="Compressor diagnostics, capacitor check and full performance test.",
                base_price=599,
                estimated_time="1–2 hrs",
                icon="🧊",
            ),
        ]
        db.add_all(services)

        mechs = [
            ("Ravi Kumar", "ravi@gmail.com", "9876543210", "AC mechanic for 8 years, authorized service experience.", "Installation, Repair, Gas Top-up", 8, 150, 13.0827, 80.2707, "T. Nagar, Chennai"),
            ("Selvam P", "selvam@gmail.com", "9876543211", "Specialist in inverter ACs and split AC repairs.", "Repair, Inverter AC", 6, 120, 13.0635, 80.2406, "Kodambakkam, Chennai"),
            ("Abdul Rahman", "abdul@gmail.com", "9876543212", "Rapid response mechanic, all AC brands serviced.", "Repair, Cleaning, Installation", 5, 100, 13.0524, 80.2508, "T. Nagar West, Chennai"),
            ("Murugan S", "murugan@gmail.com", "9876543213", "Window + split AC expert, affordable rates.", "Repair, Cleaning", 4, 80, 13.0816, 80.1741, "Vadapalani, Chennai"),
            ("Karthik V", "karthik@gmail.com", "9876543214", "Certified HVAC technician, gas charging specialist.", "Gas Top-up, Compressor", 7, 130, 13.0625, 80.2268, "Ashok Nagar, Chennai"),
            ("Suresh R", "suresh@gmail.com", "9876543215", "Same-day doorstep service, neat and professional.", "Cleaning, Installation, Repair", 5, 110, 13.0457, 80.2031, "Virugambakkam, Chennai"),
            ("Prakash M", "prakash@gmail.com", "9876543216", "Factory-trained technician for all AC brands.", "Repair, Service", 9, 140, 13.1087, 80.2217, "Anna Nagar, Chennai"),
            ("Ganesh K", "ganesh@gmail.com", "9876543217", "Fast, friendly service with transparent pricing.", "Cleaning, Repair, Installation", 3, 90, 13.0586, 80.2427, "Saidapet, Chennai"),
        ]
        for name, email, phone, bio, skills, exp, fee, lat, lng, loc in mechs:
            user = models.User(
                name=name,
                email=email,
                phone=phone,
                password_hash=hash_password("demo1234"),
                role="mechanic",
            )
            db.add(user)
            db.flush()
            db.add(
                models.MechanicProfile(
                    user_id=user.id,
                    bio=bio,
                    skills=skills,
                    years_experience=exp,
                    base_fee=fee,
                    verified=True,
                    lat=lat,
                    lng=lng,
                    location_name=loc,
                )
            )

        # Demo customer + demo mechanic
        demo_customer = models.User(
            name="Demo Customer",
            email="customer@demo.com",
            phone="9000000001",
            password_hash=hash_password("demo1234"),
            role="customer",
        )
        db.add(demo_customer)
        db.flush()

        demo_mech_user = models.User(
            name="Demo Mechanic",
            email="mechanic@demo.com",
            phone="9000000002",
            password_hash=hash_password("demo1234"),
            role="mechanic",
        )
        db.add(demo_mech_user)
        db.flush()
        db.add(
            models.MechanicProfile(
                user_id=demo_mech_user.id,
                bio="Demo mechanic account for the jury - accepts bookings instantly.",
                skills="All AC services",
                years_experience=5,
                base_fee=120,
                verified=True,
                lat=13.0700,
                lng=80.2500,
                location_name="Nungambakkam, Chennai",
            )
        )

        db.commit()
        print("Seeded: 5 services, 8 mechanics, demo customer & mechanic.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
