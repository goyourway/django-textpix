"""
内容生成器模块初始化

在 Windows 平台上设置正确的 asyncio 事件循环策略
"""
import sys
import asyncio
import logging

logger = logging.getLogger(__name__)

# Windows 平台需要使用 SelectorEventLoop 以兼容 aiohttp
if sys.platform == 'win32':
    # 设置 Windows 事件循环策略为 SelectorEventLoop
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    logger.info("✓ Windows 平台: 已设置 SelectorEventLoop 策略以兼容 aiohttp")