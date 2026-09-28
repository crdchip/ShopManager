from typing import Any 
from .schemas import APIResponse

def success_response(code: int = 1,data: Any = None, msg: str = "Thành công") -> APIResponse:
    return {
        "rCode": code,
        "rMsg": msg,
        "rData": data,
        "rError": None
    }

def error_response(code: int = 0, msg: str = "Thất bại", error: Any = None) -> APIResponse:
    return {
        "rCode": code,
        "rMsg": msg,
        "rData": None,
        "rError": error
    }
