import os
import numpy as np
from stl.mesh import Mesh
import FreeCAD
import Part
from typing import Dict, Any


class GeometryAnalyzer:
    """Analyze geometry of CAD files"""

    def estimate_processing_time(self, volume: float, surface_area: float) -> float:
        """Estimate processing time in minutes based on geometry"""
        # Calculation for Taiwanese manufacturing with 15 CNC machines:
        # - More efficient with parallel processing capabilities
        # - Higher throughput due to multiple machines
        # - Experienced operators and optimized workflows

        # Volume processing (more efficient with modern CNC machines)
        volume_time = volume / 8000  # Faster material removal rate

        # Surface finishing (skilled operators, better equipment)
        surface_time = surface_area / 800  # More efficient surface processing

        # Base setup time (reduced due to experience and automation)
        base_time = 3  # minutes for setup

        # Return with 2 decimal places
        return round(base_time + volume_time + surface_time, 2)

    def calculate_cost_usd(self, processing_time: float) -> float:
        """Calculate cost in USD based on processing time"""
        # Cost calculation for a facility with 15 CNC machines
        # Operating costs include:
        # - Machine depreciation
        # - Electricity
        # - Labor (skilled operators)
        # - Overhead (facility, maintenance, etc.)

        # Base rate in NT$ per hour for CNC operation
        hourly_rate_nt = 1500  # Competitive rate for Taiwanese market

        # Convert minutes to hours and calculate cost in NT$
        cost_nt = (processing_time / 60) * hourly_rate_nt

        # Convert to USD (approximate rate: 1 USD = 31.5 NT$)
        cost_usd = cost_nt / 31.5

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

            elif file_ext in [".iges", ".igs"]:
                # Create a new document
                doc = FreeCAD.newDocument("Analysis")

                try:
                    # Import IGES file using Part module directly
                    shape = Part.read(file_path)
                    obj = doc.addObject("Part::Feature", "IGESShape")
                    obj.Shape = shape

                    # Calculate properties
                    volume = shape.Volume
                    surface_area = shape.Area
                    center_mass = shape.CenterOfMass

                except Exception as e:
                    return {
                        "error": f"Failed to import IGES file: {str(e)}",
                        "units": "mm",
                    }
                finally:
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
