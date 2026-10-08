"""
Model Loader for BEEP Core
Handles GGUF model initialization and inference
"""
import os
from pathlib import Path
from llama_cpp import Llama
import logging
from typing import Optional, List, Dict, Any

logger = logging.getLogger(__name__)

class BeepModelLoader:
    """Manages GGUF model lifecycle"""
    
    def __init__(self, model_path: str = "assets/beep.gguf", gpu_layers: int = 50):
        """
        Initialize model loader
        
        Args:
            model_path: Path to GGUF model file
            gpu_layers: Number of layers to offload to GPU (-1 = all)
        """
        self.model_path = model_path
        self.gpu_layers = gpu_layers
        self.model: Optional[Llama] = None
        self.is_loaded = False
        
    def load(self) -> bool:
        """Load GGUF model"""
        try:
            if not os.path.exists(self.model_path):
                logger.error(f"Model not found at {self.model_path}")
                return False
            
            logger.info(f"Loading GGUF model from {self.model_path}")
            
            self.model = Llama(
                model_path=self.model_path,
                n_gpu_layers=self.gpu_layers,
                n_threads=os.cpu_count() or 4,
                verbose=False,
                chat_format="chatml"  # Compatible with OpenAI chat format
            )
            
            self.is_loaded = True
            logger.info(f"Model loaded successfully. GPU layers: {self.gpu_layers}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            self.is_loaded = False
            return False
    
    def unload(self):
        """Unload model from memory"""
        if self.model:
            del self.model
            self.model = None
            self.is_loaded = False
            logger.info("Model unloaded")
    
    def infer(
        self,
        prompt: str,
        max_tokens: int = 512,
        temperature: float = 0.7,
        top_p: float = 0.95,
        stop: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Run inference on prompt
        
        Args:
            prompt: Input text
            max_tokens: Maximum response length
            temperature: Sampling temperature
            top_p: Nucleus sampling parameter
            stop: Stop sequences
            
        Returns:
            Dict with generated text and metadata
        """
        if not self.is_loaded or not self.model:
            return {"error": "Model not loaded"}
        
        try:
            response = self.model(
                prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                stop=stop,
                echo=False
            )
            
            return {
                "text": response["choices"][0]["text"],
                "tokens": response["usage"]["completion_tokens"],
                "model": self.model_path
            }
            
        except Exception as e:
            logger.error(f"Inference error: {e}")
            return {"error": str(e)}
    
    def stream_infer(
        self,
        prompt: str,
        max_tokens: int = 512,
        temperature: float = 0.7,
        top_p: float = 0.95,
        stop: Optional[List[str]] = None
    ):
        """
        Streaming inference (yields tokens)
        """
        if not self.is_loaded or not self.model:
            yield {"error": "Model not loaded"}
            return
        
        try:
            for token in self.model(
                prompt,
                max_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                stop=stop,
                echo=False,
                stream=True
            ):
                yield token["choices"][0]["text"]
                
        except Exception as e:
            logger.error(f"Streaming inference error: {e}")
            yield f"Error: {e}"
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get model metadata"""
        if not self.model:
            return {"loaded": False}
        
        return {
            "loaded": self.is_loaded,
            "model_path": self.model_path,
            "gpu_layers": self.gpu_layers,
            "n_ctx": self.model.n_ctx() if hasattr(self.model, 'n_ctx') else "unknown"
        }


# Singleton instance
_loader: Optional[BeepModelLoader] = None

def get_model_loader(model_path: str = "assets/beep.gguf") -> BeepModelLoader:
    """Get or create singleton model loader"""
    global _loader
    if _loader is None:
        _loader = BeepModelLoader(model_path)
    return _loader
