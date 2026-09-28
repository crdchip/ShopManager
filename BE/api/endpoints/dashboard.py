from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.responses import success_response, error_response
from core.schemas import APIResponse
from modules.dashboard.services import get_dashboard_overview_service
from modules.dashboard.schemas import DashboardSummaryResponse

router = APIRouter()

@router.get("/", response_model=APIResponse[DashboardSummaryResponse])
def get_dashboard_overview(db: Session = Depends(get_db)):
    try:
        # Gọi tầng Service lấy dữ liệu thống kê tổng hợp
        data = get_dashboard_overview_service(db)
        
        # Ép kiểu/Kiểm tra qua cấu trúc định dạng Pydantic
        validated_data = DashboardSummaryResponse.model_validate(data)
        
        return success_response(
            data=validated_data,
            msg="Tải dữ liệu tổng quan Dashboard thành công."
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        return error_response(
            code=500,
            msg="Hệ thống gặp sự cố khi xử lý dữ liệu Dashboard",
            error=str(e)
        )