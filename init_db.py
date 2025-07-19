from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, City, Category, Craftsman, JobPost, AdminUser, TranslationCache
from settings import settings
import hashlib

def create_sample_data():
    engine = create_engine(settings.DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    # Check if cities already exist
    if db.query(City).first():
        print("Database already initialized!")
        db.close()
        return
    
    # Create TRNC cities
    cities_data = [
        ("Lefkoşa", "Nicosia"),
        ("Girne", "Kyrenia"),
        ("Gazimağusa", "Famagusta"),
        ("İskele", "Iskele"),
        ("Güzelyurt", "Guzelyurt"),
        ("Lefke", "Lefka")
    ]
    
    cities = []
    for city_name, city_name_en in cities_data:
        city = City(name=city_name, name_en=city_name_en)
        db.add(city)
        cities.append(city)
    
    db.commit()
    
    # Create categories
    categories_data = [
        ("Elektrikçi", "Electrician"),
        ("Tesisatçı", "Plumber"),
        ("Boyacı", "Painter"),
        ("Marangoz", "Carpenter"),
        ("Kaportacı", "Car Body Repair"),
        ("Temizlik", "Cleaning"),
        ("Bahçıvan", "Gardener"),
        ("Klimacı", "AC Technician"),
        ("İnşaat", "Construction"),
        ("Cam Ustası", "Glazier")
    ]
    
    categories = []
    for cat_name, cat_name_en in categories_data:
        category = Category(name=cat_name, name_en=cat_name_en)
        db.add(category)
        categories.append(category)
    
    db.commit()
    
    # Create sample craftsman
    sample_craftsman = Craftsman(
        name="Mehmet Öztürk",
        phone="+90 392 555 01 01",
        email="mehmet@example.com",
        description="15 yıllık deneyimim ile elektrik tesisatı, aydınlatma ve pano işleri yapıyorum. Kaliteli iş garantisi.",
        experience_years=15,
        city_id=1,  # Lefkoşa
        category_id=1  # Elektrikçi
    )
    db.add(sample_craftsman)
    
    # Create sample job post
    sample_job = JobPost(
        title="Ev Elektrik Tesisatı Tamiratı",
        description="Evimizde elektrik kesintisi sorunu yaşıyoruz. Pano kontrolü ve gerekli tamiratin yapılması gerekiyor. Acil.",
        contact_name="Ayşe Kaya",
        contact_phone="+90 392 555 02 02",
        contact_email="ayse@example.com",
        budget="500-1000 TL",
        city_id=1,  # Lefkoşa
        category_id=1,  # Elektrikçi
        is_approved=True
    )
    db.add(sample_job)
    
    # Create admin user
    admin_user = AdminUser(
        username=settings.ADMIN_USERNAME,
        password=hashlib.sha256(settings.ADMIN_PASSWORD.encode()).hexdigest(),
        is_active=True
    )
    db.add(admin_user)
    
    db.commit()
    db.close()
    
    print("Database initialized successfully!")
    print(f"Sample data created:")
    print(f"- {len(cities_data)} cities")
    print(f"- {len(categories_data)} categories")
    print(f"- 1 sample craftsman")
    print(f"- 1 sample job post")
    print(f"- Admin user: {settings.ADMIN_USERNAME}")

if __name__ == "__main__":
    create_sample_data()