import sys
import os
from unittest.mock import MagicMock
import importlib

_project_root = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, _project_root)


def mock_comfy_model_management():
    comfy_mock = MagicMock()
    comfy_mock.model_management.intermediate_device.return_value = "cpu"
    sys.modules["comfy"] = comfy_mock
    sys.modules["comfy.model_management"] = comfy_mock.model_management


mock_comfy_model_management()

# Pre-load nodes module directly (bypasses __init__.py relative import issues).
# This ensures 'from nodes import ...' works in test files without pytest
# trying to resolve the project root __init__.py as a package.
_nodes_spec = importlib.util.spec_from_file_location("nodes", os.path.join(_project_root, "nodes.py"))
_nodes_module = importlib.util.module_from_spec(_nodes_spec)
sys.modules["nodes"] = _nodes_module
_nodes_spec.loader.exec_module(_nodes_module)
