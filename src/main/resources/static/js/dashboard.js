const treeElement = document.querySelector("#tree");
const fileCountElement = document.querySelector("#file-count");
const lineCountElement = document.querySelector("#line-count");
const largestFileElement = document.querySelector("#largest-file");
const searchElement = document.querySelector("#search");
const expandAllButton = document.querySelector("#expand-all");
const collapseAllButton = document.querySelector("#collapse-all");

let rootNode = null;
let expandedPaths = new Set([""]);
let revealParentPaths = new Set();
let currentFilter = "";
let totalLines = 0;

function createNode(name, path, type) {
    return {
        name,
        path,
        type,
        lines: 0,
        children: new Map()
    };
}

function buildTree(files) {
    const root = createNode("root", "", "folder");

    for (const file of files) {
        const normalizedPath = String(file.filepath || file.filename || "").replaceAll("\\", "/");
        const parts = normalizedPath.split("/").filter(Boolean);
        let current = root;

        parts.forEach((part, index) => {
            const isFile = index === parts.length - 1;
            const childPath = current.path ? `${current.path}/${part}` : part;

            if (!current.children.has(part)) {
                current.children.set(part, createNode(part, childPath, isFile ? "file" : "folder"));
            }

            current = current.children.get(part);

            if (isFile) {
                current.type = "file";
                current.lines = Number(file.lines || 0);
            }
        });
    }

    rollupLines(root);
    return root;
}

function rollupLines(node) {
    if (node.type === "file") {
        return node.lines;
    }

    node.lines = Array.from(node.children.values()).reduce((sum, child) => sum + rollupLines(child), 0);
    return node.lines;
}

function sortedChildren(node) {
    return Array.from(node.children.values()).sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === "folder" ? -1 : 1;
        }

        return b.lines - a.lines || a.name.localeCompare(b.name);
    });
}

function nodeMatches(node, filter) {
    if (!filter) {
        return true;
    }

    const haystack = `${node.name} ${node.path}`.toLowerCase();
    return haystack.includes(filter) || sortedChildren(node).some((child) => nodeMatches(child, filter));
}

function renderTree() {
    if (!rootNode) {
        return;
    }

    treeElement.textContent = "";
    const rows = document.createDocumentFragment();

    for (const child of sortedChildren(rootNode)) {
        renderNode(child, 0, rows, rootNode.lines, "");
    }

    if (!rows.childNodes.length) {
        const empty = document.createElement("div");
        empty.className = "empty";
        empty.textContent = "Keine passenden Dateien gefunden.";
        treeElement.append(empty);
        return;
    }

    treeElement.append(rows);
    revealParentPaths.clear();
}

function renderNode(node, depth, target, parentLines, parentPath) {
    if (!nodeMatches(node, currentFilter)) {
        return;
    }

    const hasChildren = node.children.size > 0;
    const row = document.createElement("div");
    row.className = `tree-row ${node.type}`;
    if (revealParentPaths.has(parentPath)) {
        row.classList.add("is-entering");
    }
    row.style.setProperty("--depth", String(depth));

    const nameCell = document.createElement("div");
    nameCell.className = "tree-name";

    if (hasChildren) {
        const toggle = document.createElement("button");
        toggle.className = "toggle";
        toggle.type = "button";
        toggle.setAttribute("aria-label", `${node.name} aufklappen`);
        toggle.setAttribute("aria-expanded", String(isExpanded(node)));
        toggle.addEventListener("click", () => {
            if (isExpanded(node)) {
                expandedPaths.delete(node.path);
            } else {
                expandedPaths.add(node.path);
                revealParentPaths.add(node.path);
            }
            renderTree();
        });
        nameCell.append(toggle);
    } else {
        const spacer = document.createElement("span");
        spacer.className = "spacer";
        nameCell.append(spacer);
    }

    const icon = document.createElement("span");
    icon.className = "node-icon";
    nameCell.append(icon);

    const label = document.createElement("span");
    label.className = "node-label";
    label.textContent = node.name;
    label.title = node.path;
    nameCell.append(label);

    if (node.type === "file") {
        const path = document.createElement("span");
        path.className = "node-path";
        path.textContent = node.path;
        path.title = node.path;
        nameCell.append(path);
    }

    const lines = document.createElement("span");
    lines.className = "line-value";
    lines.textContent = formatNumber(node.lines);

    const share = parentLines > 0 ? node.lines / parentLines : 0;
    const shareCell = document.createElement("div");
    shareCell.className = "share-cell";
    shareCell.title = depth === 0
        ? `${formatPercent(share)} der gesamten Zeilen`
        : `${formatPercent(share)} der Zeilen in diesem Ordner`;

    const shareTrack = document.createElement("span");
    shareTrack.className = "share-track";

    const shareBar = document.createElement("span");
    shareBar.className = "share-bar";
    shareBar.style.width = `${Math.max(0.8, share * 100)}%`;

    const shareValue = document.createElement("span");
    shareValue.className = "share-value";
    shareValue.textContent = formatPercent(share);

    shareTrack.append(shareBar);
    shareCell.append(shareTrack, shareValue);

    row.append(nameCell, shareCell, lines);
    target.append(row);

    if (hasChildren && (isExpanded(node) || currentFilter)) {
        for (const child of sortedChildren(node)) {
            renderNode(child, depth + 1, target, node.lines, node.path);
        }
    }
}

function isExpanded(node) {
    return expandedPaths.has(node.path);
}

function expandAll() {
    walk(rootNode, (node) => {
        if (node.type === "folder") {
            expandedPaths.add(node.path);
            revealParentPaths.add(node.path);
        }
    });
    renderTree();
}

function collapseAll() {
    expandedPaths = new Set([""]);
    revealParentPaths.clear();
    renderTree();
}

function walk(node, callback) {
    if (!node) {
        return;
    }

    callback(node);
    for (const child of node.children.values()) {
        walk(child, callback);
    }
}

function updateStats(files) {
    totalLines = files.reduce((sum, file) => sum + Number(file.lines || 0), 0);
    const largest = files.reduce((best, file) => Number(file.lines || 0) > Number(best?.lines || 0) ? file : best, null);

    fileCountElement.textContent = formatNumber(files.length);
    lineCountElement.textContent = formatNumber(totalLines);
    largestFileElement.textContent = largest ? largest.filename : "-";
    largestFileElement.title = largest ? largest.filepath : "";
}

function formatNumber(value) {
    return new Intl.NumberFormat("de-AT").format(value);
}

function formatPercent(value) {
    return new Intl.NumberFormat("de-AT", {
        minimumFractionDigits: value > 0 && value < 0.01 ? 1 : 0,
        maximumFractionDigits: value > 0 && value < 0.01 ? 1 : 0
    }).format(value * 100) + "%";
}

async function loadCounts() {
    try {
        const response = await fetch("/api/all-counts", {headers: {"Accept": "application/json"}});

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const payload = await response.json();
        const files = Array.isArray(payload?.files) ? payload.files : [];

        updateStats(files);
        rootNode = buildTree(files);
        renderTree();
    } catch (error) {
        treeElement.innerHTML = `<div class="error">Linecounts konnten nicht geladen werden.</div>`;
        console.error(error);
    }
}

searchElement.addEventListener("input", (event) => {
    currentFilter = event.target.value.trim().toLowerCase();
    renderTree();
});

expandAllButton.addEventListener("click", expandAll);
collapseAllButton.addEventListener("click", collapseAll);

loadCounts();
