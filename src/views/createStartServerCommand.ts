import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { App } from "obsidian";
import type { SlidevPluginSettings } from "../SlidevSettingTab";
import { getVaultPath } from "../utils/getVaultPath";

export function createStartServerCommand({
	app,
	config,
}: {
	app: App;
	config: SlidevPluginSettings;
}) {
	const vaultPath = getVaultPath(app.vault);
	const templatePath = config.slidevTemplateLocation;
	const options = { env: process.env, shell: true, cwd: templatePath };

	const activeFile = app.workspace.getActiveFile();
	const currentSlideFilePath = activeFile == null ? "" : activeFile.path;
	const slideRelPath = path.join(vaultPath, currentSlideFilePath);
	if (!fs.lstatSync(slideRelPath).isFile()) {
		return spawn(`echo 'not file: ${slideRelPath}'`, [], options);
	}

	const codeBlockContent = [
		// This makes node & npm usable
		config.initialScript,
		// If you use npm scripts, don't forget to add -- after the npm command:
		`ln -sf '${slideRelPath}' slides.md`,
		`npm run slidev -- --port ${config.port}`,
	].join("\n");
	return spawn(codeBlockContent, [], options);
}
