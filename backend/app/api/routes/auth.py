from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from datetime import timedelta as td
from app.database import get_db
from app.models import User
from app import schemas, security
from app.config import get_settings
from app.core.supabase_client import supabase

settings = get_settings()
router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.TokenResponse)
async def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    hashed_password = security.get_password_hash(user_data.password)
    
    new_user = User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hashed_password
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": new_user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username,
            "is_active": new_user.is_active,
            "created_at": new_user.created_at
        }
    }


@router.post("/login", response_model=schemas.TokenResponse)
async def login(credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not security.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "username": user.username,
            "is_active": user.is_active,
            "created_at": user.created_at
        }
    }


@router.post("/init-profile")
async def init_profile(current_user: User = Depends(security.get_current_user)):
    try:
        from_date = datetime.now()
        to_date = from_date + td(days=30)
        
        try:
            profile_response = supabase.table('profiles').insert({
                'id': str(current_user.id),
                'email': current_user.email,
                'subscription_tier': 'free',
                'subscription_status': 'active',
                'tokens_total': 20,
                'tokens_used': 0,
                'bonus_tokens': 0,
                'created_at': from_date.isoformat(),
                'updated_at': from_date.isoformat()
            }).execute()
        except Exception as profile_error:
            error_msg = str(profile_error)
            if 'duplicate' in error_msg.lower() or 'already exists' in error_msg.lower() or '23505' in error_msg:
                return {"success": True, "message": "Profile already exists"}
            raise
        
        try:
            subscription_response = supabase.table('subscriptions').insert({
                'user_id': str(current_user.id),
                'plan_name': 'Free Tier',
                'billing_cycle': 'monthly',
                'status': 'active',
                'started_at': from_date.isoformat(),
                'expires_at': to_date.isoformat(),
                'tokens_total': 20,
                'tokens_used': 0,
                'price_paid': 0,
                'created_at': from_date.isoformat()
            }).execute()
        except Exception as subscription_error:
            error_msg = str(subscription_error)
            if 'duplicate' in error_msg.lower() or 'already exists' in error_msg.lower() or '23505' in error_msg:
                return {"success": True, "message": "Subscription already exists"}
            raise
        
        return {"success": True, "message": "Profile initialized"}
    except Exception as e:
        error_msg = str(e)
        if 'duplicate' in error_msg.lower() or 'already exists' in error_msg.lower() or '23503' in error_msg or '23505' in error_msg:
            return {"success": True, "message": "Profile already exists"}
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize profile: {error_msg}"
        )


@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user(current_user: User = Depends(security.get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }


@router.get("/profile")
async def get_profile(current_user: User = Depends(security.get_current_user)):
    try:
        profile = supabase.table('profiles').select('*').eq('id', str(current_user.id)).execute()
        if profile.data and len(profile.data) > 0:
            return profile.data[0]
        return {
            "id": str(current_user.id),
            "email": current_user.email,
            "subscription_tier": "free",
            "subscription_status": "active",
            "tokens_total": 20,
            "tokens_used": 0,
            "bonus_tokens": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "id": str(current_user.id),
            "email": current_user.email,
            "subscription_tier": "free",
            "subscription_status": "active",
            "tokens_total": 20,
            "tokens_used": 0,
            "bonus_tokens": 0,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
