import os
import numpy as np
from stl.mesh import Mesh
import FreeCAD
import Part
from typing import Dict, Any


class GeometryAnalyzer:
    """Analyze geometry of CAD files"""

    def estimate_processing_time(self, volume: float, surface_area: float) -> float:
        """
        Estimate processing time in minutes based on geometry and complexity

        Factors considered:
        - Volume removal rate (varies with material hardness)
        - Surface complexity (ratio of surface area to volume^(2/3))
        - Setup time (base time for machine setup)
        - Finishing time (based on surface area)
        """
        # Calculate shape complexity factor
        # Using surface area to volume ratio compared to a perfect sphere
        # Higher ratio means more complex shape
        theoretical_min_surface_area = 4.836 * pow(
            volume, 2 / 3
        )  # Surface area of a sphere with same volume
        complexity_factor = min(3.0, surface_area / theoretical_min_surface_area)

        # Base setup time (minutes)
        base_time = 5.0

        # Volume processing time
        # Assuming average material hardness
        # 6000 mm³/min is a typical material removal rate for medium hardness materials
        volume_time = (volume / 6000) * complexity_factor

        # Surface finishing time
        # Assuming 500 mm²/min for standard finish
        # Adjusted by complexity factor
        surface_time = (surface_area / 500) * complexity_factor

        # Add contingency for tool changes and precision adjustments
        contingency_time = (volume_time + surface_time) * 0.15

        total_time = base_time + volume_time + surface_time + contingency_time

        # Round to 2 decimal places
        return round(total_time, 2)

    def calculate_cost_usd(self, processing_time: float) -> float:
        """
        Calculate cost in USD based on processing time and complexity

        Factors considered:
        - Machine operation cost
        - Labor cost
        - Material handling
        - Setup and teardown
        """
        # Base rate in NT$ per hour for CNC operation
        hourly_rate_nt = 1500  # Competitive rate for Taiwanese market

        # Add setup cost
        setup_cost_nt = 500

        # Calculate operation cost
        operation_cost_nt = (processing_time / 60) * hourly_rate_nt

        # Total cost in NT$
        total_cost_nt = setup_cost_nt + operation_cost_nt

        # Convert to USD (approximate rate: 1 USD = 31.5 NT$)
        cost_usd = total_cost_nt / 31.5

        # Return with 2 decimal places
        return round(cost_usd, 2)

    def analyze_file(self, file_path: str) -> Dict[str, Any]:
        """Analyze a CAD file and return its geometric properties"""
        try:
            # Get file extension
            file_ext = os.path.splitext(file_path)[1].lower()

            if file_ext == ".stl":
                # Load the STL file
                mesh_data = Mesh.from_file(file_path)

                # Calculate basic properties
                volume = mesh_data.get_mass_properties()[0]  # Volume
                surface_area = np.sum(mesh_data.areas)  # Total surface area
                center_mass = mesh_data.get_mass_properties()[1]  # Center of mass

            elif file_ext in [".step", ".stp"]:
                # Create a new document
                doc = FreeCAD.newDocument("Analysis")

                # Import STEP file
                Part.insert(file_path, doc.Name)

                # Get the shape from the imported object
                shape = doc.Objects[0].Shape

                # Calculate properties
                volume = shape.Volume
                surface_area = shape.Area
                center_mass = shape.CenterOfMass

                # Clean up
                FreeCAD.closeDocument(doc.Name)

            else:
                return {
                    "error": f"Unsupported file format for analysis: {file_ext}",
                    "units": "mm",
                }

            # Estimate processing time and cost
            processing_time = self.estimate_processing_time(volume, surface_area)
            cost_usd = self.calculate_cost_usd(processing_time)

            return {
                "volume": float(volume),
                "surface_area": float(surface_area),
                "center_of_mass": (
                    [float(x) for x in center_mass]
                    if isinstance(center_mass, (list, tuple, np.ndarray))
                    else [
                        float(center_mass.x),
                        float(center_mass.y),
                        float(center_mass.z),
                    ]
                ),
                "processing_time": float(processing_time),
                "cost_usd": cost_usd,
                "units": "mm",
            }

        except Exception as e:
            return {"error": f"Analysis failed: {str(e)}", "units": "mm"}
