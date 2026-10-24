"""
Dahua NetSDK Ctypes Data Structures (<75 lines).
Defines official C-structures per Dahua NetSDK Header specifications.
"""
import ctypes
from ctypes import (
    c_int, c_uint, c_void_p, c_char, c_byte, c_longlong,
    Structure, POINTER, CFUNCTYPE, sizeof
)

EM_LOGIN_SPEC_CAP_TCP = 0
EM_LOGIN_SPEC_CAP_P2P = 2

class NET_DEVICEINFO_Ex(Structure):
    _fields_ = [
        ("sSerialNumber", c_char * 48),
        ("byAlarmInPortNum", c_byte),
        ("byAlarmOutPortNum", c_byte),
        ("byDiskNum", c_byte),
        ("byDVRType", c_byte),
        ("byChanNum", c_byte),
        ("byLimitLoginTime", c_byte),
        ("byLeftLogTimes", c_byte),
        ("byReserved", c_byte),
        ("bLimitLoginTime", c_int),
        ("dwLeftLoginTime", c_uint),
        ("reserved", c_byte * 516),
    ]

class NET_IN_LOGIN_WITH_HIGHLEVEL_SECURITY(Structure):
    _fields_ = [
        ("dwSize", c_uint),
        ("szIP", c_char * 64),
        ("nPort", c_int),
        ("szUserName", c_char * 64),
        ("szPassword", c_char * 64),
        ("emSpecCap", c_int),
        ("pCapParam", c_void_p),
    ]

class NET_OUT_LOGIN_WITH_HIGHLEVEL_SECURITY(Structure):
    _fields_ = [
        ("dwSize", c_uint),
        ("stuDeviceInfo", NET_DEVICEINFO_Ex),
        ("nError", c_int),
        ("reserved", c_byte * 132),
    ]

class NET_IN_REALPLAY(Structure):
    _fields_ = [
        ("dwSize", c_uint),
        ("nChannelID", c_int),
        ("hWnd", c_void_p),
        ("rType", c_int),
        ("cbRealData", c_void_p),
        ("dwUser", c_void_p),
        ("bWaitKeyFrame", c_int),
        ("szDirectIP", c_char * 64),
        ("nDirectPort", c_int),
        ("emRealPlayType", c_int),
        ("reserved", c_byte * 128),
    ]

class NET_OUT_REALPLAY(Structure):
    _fields_ = [
        ("dwSize", c_uint),
        ("reserved", c_byte * 128),
    ]

fDisConnect = CFUNCTYPE(None, c_longlong if sizeof(c_void_p) == 8 else c_int, ctypes.c_char_p, c_int, c_void_p)
fHaveReConnect = CFUNCTYPE(None, c_longlong if sizeof(c_void_p) == 8 else c_int, ctypes.c_char_p, c_int, c_void_p)
fRealDataCallBackEx = CFUNCTYPE(None, c_longlong if sizeof(c_void_p) == 8 else c_int, c_uint, POINTER(c_byte), c_uint, c_uint, c_void_p)
