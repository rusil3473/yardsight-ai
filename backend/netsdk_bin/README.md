# Dahua Official NetSDK Binaries Directory

This directory is the drop location for Dahua's official 64-bit dynamic link libraries (DLLs) required for programmatic P2P connection to your Dahua NVR / IP Camera (`DH-IPC-HFW1439TL2-A-IL`, Serial Number `AG07AA7PCA3D3B6`).

## Why these DLLs are needed:
Dahua's P2P protocol is a proprietary, end-to-end encrypted cloud relay system (Easy4IP). 
Dahua does not release this protocol as an open Python package on PyPI (`pip install` cannot supply proprietary C binaries). 
Instead, Dahua packages the compiled C runtime as `General_NetSDK_Eng_Python_Win64`.

## Where to get the DLLs:
1. Visit the **Dahua Partner Alliances Portal** (or [Dahua Open Platform](https://partner.dahuatech.com/)).
2. Download the **Dahua Python NetSDK (Windows x64)** package.
3. Extract the following DLL files directly into this directory (`yardsight/backend/netsdk_bin/`):
   - `dhnetsdk.dll` (Primary NetSDK dynamic library)
   - `dhplay.dll` (Video stream decoder and player engine)
   - `avnetsdk.dll` (Audio / Video packet processing)
   - `dhconfigsdk.dll` (Device configuration module)
   - `NetSDK.py` (Optional: python wrapper reference)

## How YardSight AI Uses It:
When `dhnetsdk.dll` is present in this folder, `backend/services/dahua_netsdk_service.py` automatically initializes the Dahua C runtime and executes:
```python
stuInParam = NET_IN_LOGIN_WITH_HIGHLEVEL_SECURITY()
stuInParam.dwSize = sizeof(NET_IN_LOGIN_WITH_HIGHLEVEL_SECURITY)
stuInParam.szIP = b"AG07AA7PCA3D3B6"   # Device Serial Number
stuInParam.nPort = 0
stuInParam.szUserName = b"admin"
stuInParam.szPassword = b"Shri@21*"
stuInParam.emSpecCap = 2              # EM_LOGIN_SPEC_CAP_P2P (Native P2P mode)

loginID, deviceInfo, err = CLIENT_LoginWithHighLevelSecurity(stuInParam, stuOutParam)
```
This connects directly over the internet to your remote Godown camera via Dahua's P2P cloud relay without requiring any mobile phone, USB cable, ADB screencasting, or router port-forwarding!
