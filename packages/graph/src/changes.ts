import type { GraphStore } from "./store";
import type { ChangeInfo, GraphNode, RiskScoredNode } from "./types";

export class ChangeDetector {
	constructor(private store: GraphStore) {}

	mapChangesToNodes(changes: ChangeInfo[]): RiskScoredNode[] {
		const results: RiskScoredNode[] = [];
		for (const change of changes) {
			const fileNodes = this.store.getNodesByFilePath(change.filePath);
			for (const node of fileNodes) {
				const overlaps = change.lineRanges.some(
					(range) =>
						node.line_start <= range.end && node.line_end >= range.start,
				);
				if (overlaps) {
					const riskScore = this.computeRiskScore(node);
					const reasons = this.getRiskReasons(node);
					results.push({ node, riskScore, reasons });
				}
			}
		}
		results.sort((a, b) => b.riskScore - a.riskScore);
		return results;
	}

	private computeRiskScore(node: GraphNode): number {
		let score = 0.0;
		const incoming = this.store.getEdgesTo(node.id);
		const callers = incoming.filter((e) => e.kind === "CALLS").length;
		score += Math.min(callers * 0.1, 0.4);
		const outgoing = this.store.getEdgesFrom(node.id);
		score += Math.min(outgoing.length * 0.05, 0.2);
		const testedBy = incoming.filter((e) => e.kind === "TESTED_BY").length;
		if (testedBy > 0) score *= 0.7;
		if (node.is_test) score *= 0.3;
		return Math.min(score, 1.0);
	}

	private getRiskReasons(node: GraphNode): string[] {
		const reasons: string[] = [];
		const incoming = this.store.getEdgesTo(node.id);
		const callers = incoming.filter((e) => e.kind === "CALLS").length;
		const tested = incoming.filter((e) => e.kind === "TESTED_BY").length;
		if (callers > 3) reasons.push(`High fan-in: ${callers} callers`);
		if (tested === 0) reasons.push("No test coverage");
		if (node.is_test) reasons.push("Test file (low impact)");
		return reasons;
	}
}
