"""Stateless parser worker for kokuin. JSON-RPC over stdin/stdout."""
import json
import sys

sys.path.insert(0, "refs/code-review-graph")

from code_review_graph.parser import parse_file


def handle_request(request):
    method = request.get("method")
    params = request.get("params", {})
    req_id = request.get("id")

    if method == "parse":
        files = params.get("files", [])
        all_nodes = []
        all_edges = []
        for file_info in files:
            path = file_info["path"]
            language = file_info.get("language")
            try:
                nodes, edges = parse_file(path, language=language)
                for node in nodes:
                    all_nodes.append({
                        "kind": node.kind,
                        "name": node.name,
                        "qualifiedName": node.qualified_name,
                        "filePath": node.file_path,
                        "lineStart": node.line_start,
                        "lineEnd": node.line_end,
                        "language": node.language,
                        "parentName": node.parent_name,
                        "params": node.params,
                        "returnType": node.return_type,
                        "modifiers": node.modifiers,
                        "isTest": node.is_test,
                        "fileHash": node.file_hash,
                    })
                for edge in edges:
                    all_edges.append({
                        "sourceQualifiedName": edge.source,
                        "targetQualifiedName": edge.target,
                        "kind": edge.kind,
                        "weight": getattr(edge, "weight", 1.0),
                    })
            except Exception as e:
                sys.stderr.write(f"Error parsing {path}: {e}\n")
        return {"id": req_id, "result": {"nodes": all_nodes, "edges": all_edges}}
    elif method == "ping":
        return {"id": req_id, "result": "pong"}
    return {"id": req_id, "error": {"message": f"Unknown method: {method}"}}


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
            response = handle_request(request)
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()
        except json.JSONDecodeError as e:
            sys.stdout.write(json.dumps({"id": None, "error": {"message": f"Invalid JSON: {e}"}}) + "\n")
            sys.stdout.flush()


if __name__ == "__main__":
    main()
