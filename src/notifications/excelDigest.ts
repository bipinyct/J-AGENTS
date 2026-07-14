import { mkdir } from "node:fs/promises";
import ExcelJS from "exceljs";
import type { ScoredJob } from "../types.js";

function scoreFill(score: number): string {
  if (score >= 80) return "FFC6EFCE"; // green
  if (score >= 65) return "FFFFEB9C"; // yellow
  if (score >= 45) return "FFFCD5B4"; // orange
  return "FFF2F2F2"; // gray
}

const WRAP_COLUMNS = ["reasoning", "strengths", "gaps", "coverLetter", "title"];

export async function writeExcelDigest(scored: ScoredJob[], stamp: string): Promise<string> {
  const dir = "digests";
  await mkdir(dir, { recursive: true });
  const path = `${dir}/${stamp}.xlsx`;

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Jobs", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: "Fit Score", key: "fitScore", width: 10 },
    { header: "Title", key: "title", width: 32 },
    { header: "Company", key: "company", width: 22 },
    { header: "Location", key: "location", width: 18 },
    { header: "Board", key: "board", width: 10 },
    { header: "Posted", key: "posted", width: 14 },
    { header: "Why It Fits", key: "reasoning", width: 50 },
    { header: "Strengths", key: "strengths", width: 40 },
    { header: "Gaps", key: "gaps", width: 32 },
    { header: "Cover Letter", key: "coverLetter", width: 60 },
    { header: "Apply Link", key: "apply", width: 14 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0066CC" } };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  sheet.autoFilter = { from: "A1", to: "K1" };

  const sorted = [...scored].sort((a, b) => b.fitScore - a.fitScore);

  for (const job of sorted) {
    const row = sheet.addRow({
      fitScore: job.fitScore,
      title: job.title,
      company: job.company,
      location: job.location,
      board: job.board,
      posted: job.postedAt ? new Date(job.postedAt).toDateString() : "recent",
      reasoning: job.reasoning,
      strengths: job.strengths.join("\n"),
      gaps: job.gaps.length ? job.gaps.join("\n") : "—",
      coverLetter: job.coverLetter ?? "",
    });

    row.getCell("fitScore").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: scoreFill(job.fitScore) },
    };
    row.getCell("fitScore").alignment = { horizontal: "center", vertical: "top" };

    const applyCell = row.getCell("apply");
    applyCell.value = { text: "Apply →", hyperlink: job.url };
    applyCell.font = { color: { argb: "FF0563C1" }, underline: true };
    applyCell.alignment = { vertical: "top" };

    for (const key of WRAP_COLUMNS) {
      row.getCell(key).alignment = { wrapText: true, vertical: "top" };
    }
    row.commit();
  }

  await workbook.xlsx.writeFile(path);
  console.log(`[digest] wrote ${path}`);
  return path;
}
