import os
import sys
import FreeCAD
import Part
import Mesh


class CADConverter:
    """CAD file format converter using FreeCAD"""

    def __init__(self):
        self.supported_input_formats = [".step", ".stp", ".iges", ".igs", ".stl"]
        self.supported_output_formats = [".stl", ".step", ".stp"]

    def convert_file(self, input_path: str, output_path: str) -> bool:
        """Convert CAD file from one format to another"""
        try:
            input_ext = os.path.splitext(input_path)[1].lower()
            output_ext = os.path.splitext(output_path)[1].lower()

            if input_ext not in self.supported_input_formats:
                raise ValueError(f"Unsupported input format: {input_ext}")
            if output_ext not in self.supported_output_formats:
                raise ValueError(f"Unsupported output format: {output_ext}")

            # Create a new document
            doc = FreeCAD.newDocument("Conversion")

            # Import the file
            if input_ext in [".step", ".stp"]:
                Part.insert(input_path, doc.Name)
            elif input_ext in [".iges", ".igs"]:
                Part.insert(input_path, doc.Name)
            elif input_ext == ".stl":
                Mesh.insert(input_path, doc.Name)

            # Export to the desired format
            if output_ext in [".step", ".stp"]:
                Part.export(doc.Objects, output_path)
            elif output_ext == ".stl":
                # If input was a mesh, export directly
                if input_ext == ".stl":
                    doc.Objects[0].Mesh.write(output_path)
                # If input was a shape, create a mesh first
                else:
                    shapes = [obj for obj in doc.Objects if hasattr(obj, "Shape")]
                    mesh = Mesh.Mesh()
                    for shape in shapes:
                        mesh.addFacets(shape.Shape.tessellate(0.1))
                    mesh.write(output_path)

            FreeCAD.closeDocument(doc.Name)
            return True

        except Exception as e:
            print(f"Conversion error: {str(e)}")
            return False
