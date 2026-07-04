"""ComfyUI-QuickLatent - Quick direct-size latent image generation node.

Exports NODE_CLASS_MAPPINGS, NODE_DISPLAY_NAME_MAPPINGS, and WEB_DIRECTORY
for ComfyUI custom node registration.
"""

try:
    from .nodes import QuickLatent
except ImportError:
    from nodes import QuickLatent

NODE_CLASS_MAPPINGS = {"QuickLatent": QuickLatent}
NODE_DISPLAY_NAME_MAPPINGS = {"QuickLatent": "Quick Latent"}
WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
