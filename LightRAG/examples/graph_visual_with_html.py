import pipmaster as pm
import os
if not pm.is_installed("pyvis"):
    pm.install("pyvis")
if not pm.is_installed("networkx"):
    pm.install("networkx")

import networkx as nx
from pyvis.network import Network
import random

# Get the RAG_DIR from environment variable instead of hardcoding
rag_dir = os.environ.get("RAG_DIR", "./dickens")
graphml_filename = "graph_chunk_entity_relation.graphml"
graphml_path = os.path.join(rag_dir, graphml_filename)

# 获取当前脚本的目录
script_dir = os.path.dirname(os.path.abspath(__file__))
# 输出html文件名
output_html_filename = "knowledge_graph.html"
# 输出html文件路径
output_html_path = os.path.join(script_dir, output_html_filename)

# 加载graphml文件
G = nx.read_graphml(graphml_path)

# # Load the GraphML file
# G = nx.read_graphml("./dickens/graph_chunk_entity_relation.graphml")


# Create a Pyvis network
net = Network(height="100vh", notebook=True)

# Convert NetworkX graph to Pyvis network
net.from_nx(G)


# Add colors and title to nodes
for node in net.nodes:
    node["color"] = "#{:06x}".format(random.randint(0, 0xFFFFFF))
    if "description" in node:
        node["title"] = node["description"]

# Add title to edges
for edge in net.edges:
    if "description" in edge:
        edge["title"] = edge["description"]

# Save and display the network
net.show("knowledge_graph.html")
