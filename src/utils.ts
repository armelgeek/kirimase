import fs, { existsSync } from "fs";
import path from "path";
import { consola } from "consola";
import { AvailablePackage, Config, PMType, UpdateConfig } from "./types.js";
import { execa } from "execa";
import { spinner } from "./commands/add/index.js";
/**
 * Creates a promise that resolves after a specified number of milliseconds.
 *
 * @param {number} ms - The number of milliseconds to delay. Default is 2000.
 * @return {Promise<void>} A promise that resolves after the specified delay.
 */
export const delay = (ms = 2000) =>
  new Promise((resolve) => setTimeout(resolve, ms));
/**
 * Creates a file at the specified path with the given content.
 *
 * @param {string} filePath - The path to the file to be created.
 * @param {string} content - The content to be written to the file.
 * @return {void} This function does not return a value.
 */
export function createFile(filePath: string, content: string) {
  const resolvedPath = path.resolve(filePath);
  const dirName = path.dirname(resolvedPath);

  // Check if the directory exists
  if (!fs.existsSync(dirName)) {
    // If not, create the directory and any nested directories that might be needed
    fs.mkdirSync(dirName, { recursive: true });
    // consola.success(`Directory ${dirName} created.`);
  }

  fs.writeFileSync(resolvedPath, content);
  // TODO - add flag for verbose
  // consola.success(`File created at ${filePath}`);
}
/**
 * Replaces a file at the specified path with the given content.
 *
 * @param {string} filePath - The path to the file to be replaced.
 * @param {string} content - The new content to be written to the file.
 * @param {boolean} log - Flag indicating whether to log the replacement action. Defaults to true.
 * @return {void} This function does not return a value.
 */
export function replaceFile(filePath: string, content: string, log = true) {
  const resolvedPath = path.resolve(filePath);
  const dirName = path.dirname(resolvedPath);

  // Check if the directory exists
  if (!fs.existsSync(dirName)) {
    // If not, create the directory and any nested directories that might be needed
    fs.mkdirSync(dirName, { recursive: true });
    // consola.success(`Directory ${dirName} created.`);
  }

  fs.writeFileSync(resolvedPath, content);
  if (log === true) {
    // TODO as above
    // consola.success(`File replaced at ${filePath}`);
  }
}
/**
 * Creates a folder at the specified relative path.
 *
 * @param {string} relativePath - The relative path of the folder to be created.
 * @param {boolean} [log=false] - Optional. If true, logs a success message.
 * @return {void} This function does not return anything.
 */
export function createFolder(relativePath: string, log = false) {
  const fullPath = path.join(process.cwd(), relativePath);
  fs.mkdirSync(fullPath, { recursive: true });
  if (log) {
    // TODO as above
    // consola.success(`Folder created at ${fullPath}`);
  }
}
/**
 * Runs a command with the provided arguments.
 *
 * @param {string} command - The command to be executed.
 * @param {string[]} args - The arguments to be passed to the command.
 * @return {Promise<void>} A promise that resolves when the command is executed.
 */
export const runCommand = async (command: string, args: string[]) => {
  const formattedArgs = args.filter((a) => a !== "");
  try {
    await execa(command, formattedArgs, {
      stdio: "inherit",
    });
  } catch (error) {
    throw new Error(
      `command "${command} ${formattedArgs
        .join(" ")
        .trim()}" exited with code ${error.code}`
    );
  }
};
/**
 * Install packages based on the specified package list and package manager type.
 *
 * @param {{ regular: string; dev: string }} packages - The regular and dev packages to install.
 * @param {PMType} pmType - The package manager type to use (npm or yarn).
 * @return {Promise<void>} A promise that resolves after installing the packages.
 */
export async function installPackages(
  packages: { regular: string; dev: string },
  pmType: PMType
) {
  const packagesListString = packages.regular.concat(" ").concat(packages.dev);
  // consola.start(`Installing packages: ${packagesListString}...`);

  const installCommand = pmType === "npm" ? "install" : "add";

  try {
    spinner.stop();
    consola.info("Installing Dependencies");
    if (packages.regular) {
      await runCommand(
        pmType,
        [installCommand].concat(packages.regular.split(" "))
      );
    }
    if (packages.dev) {
      await runCommand(
        pmType,
        [installCommand, "-D"].concat(packages.dev.split(" "))
      );
    }
    // consola.success(
    //   `Regular dependencies installed: \n${packages.regular
    //     .split(" ")
    //     .join("\n")}`
    // );
    // consola.success(
    //   `Dev dependencies installed: \n${packages.dev.split(" ").join("\n")}`
    // );
  } catch (error) {
    console.error(`An error occurred: ${error.message}`);
  }
}
/**
 * Creates a config file with the provided options.
 *
 * @param {Config} options - The options to be stringified and written to the config file.
 * @return {void}
 */
export const createConfigFile = (options: Config) => {
  createFile("./kirimase.config.json", JSON.stringify(options, null, 2));
};
/**
 * Updates the configuration file with the provided options.
 *
 * @param {UpdateConfig} options - The options to be merged with the existing configuration.
 * @return {void} This function does not return anything.
 */
export const updateConfigFile = (options: UpdateConfig) => {
  const config = readConfigFile();
  const newConfig = { ...config, ...options };
  replaceFile(
    "./kirimase.config.json",
    JSON.stringify(newConfig, null, 2),
    false
  );
};
/**
 * Reads the configuration file "kirimase.config.json" and returns the parsed content along with the root path.
 *
 * @return {(Config & { rootPath: string }) | null} The parsed configuration object with the root path, or null if the file does not exist.
 */
export const readConfigFile = (): (Config & { rootPath: string }) | null => {
  // Define the path to package.json
  const configPath = path.join(process.cwd(), "kirimase.config.json");

  if (!fs.existsSync(configPath)) {
    return null;
  }
  // Read package.json
  const configJsonData = fs.readFileSync(configPath, "utf-8");

  // Parse package.json content
  let config: Config = JSON.parse(configJsonData);

  const rootPath = config.hasSrc ? "src/" : "";
  return { ...config, rootPath };
};
/**
 * Adds a package to the configuration file.
 *
 * @param {AvailablePackage} packageName - The package to be added to the configuration.
 * @return {void} This function does not return anything.
 */
export const addPackageToConfig = (packageName: AvailablePackage) => {
  const config = readConfigFile();
  updateConfigFile({ packages: [...config?.packages, packageName] });
};
/**
 * Wraps the input string in parentheses.
 *
 * @param {string} string - The string to be wrapped in parentheses.
 * @return {string} The input string wrapped in parentheses.
 */
export const wrapInParenthesis = (string: string) => {
  return "(" + string + ")";
};

// shadcn specific utils

export const pmInstallCommand = {
  pnpm: "pnpm",
  npm: "npx",
  yarn: "npx",
  bun: "bunx",
};
/**
 * Asynchronously installs ShadcnUI components.
 *
 * @param {string[]} components - The names of the components to install.
 * @return {Promise<void>} A promise that resolves when the components are installed.
 */
export async function installShadcnUIComponents(
  components: string[]
): Promise<void> {
  const { preferredPackageManager, hasSrc } = readConfigFile();
  const componentsToInstall: string[] = [];

  for (const component of components) {
    const tsxFilePath = path.resolve(
      `${hasSrc ? "src/" : ""}components/ui/${component}.tsx`
    );

    if (!existsSync(tsxFilePath)) {
      componentsToInstall.push(component);
    }
  }
  const baseArgs = ["shadcn-ui@latest", "add", ...componentsToInstall];
  const installArgs =
    preferredPackageManager === "pnpm" ? ["dlx", ...baseArgs] : baseArgs;

  if (componentsToInstall.length > 0) {
    // consola.start(
    //   `Installing shadcn-ui components: ${componentsToInstall.join(", ")}`
    // );
    try {
      spinner.stop();
      consola.info("Installing ShadcnUI Components");
      await execa(pmInstallCommand[preferredPackageManager], installArgs, {
        stdio: "inherit",
      });
      // consola.success(
      //   `Installed components: ${componentsToInstall.join(", ")}`
      // );
    } catch (error) {
      consola.error(`Failed to install components: ${error.message}`);
    }
  } else {
    // consola.info("All items already installed.");
  }
}

export const getFileContents = (filePath: string) => {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    consola.error("File does not exist at", filePath);
    return "";
  }
  return fs.readFileSync(filePath, "utf-8");
};
/**
 * Updates the configuration file after an update.
 *
 * @return {void} This function does not return a value.
 */
export const updateConfigFileAfterUpdate = () => {
  const { packages, orm, auth } = readConfigFile();
  if (orm === undefined || auth === undefined) {
    const updatedOrm = packages.includes("drizzle") ? "drizzle" : null;
    const updatedAuth = packages.includes("next-auth") ? "next-auth" : null;
    updateConfigFile({ orm: updatedOrm, auth: updatedAuth });
    consola.info("Config file updated.");
  } else {
    consola.info("Config file already up to date.");
  }
};

type T3Deltas = {
  alias: string;
  trpcRootDir: string;
  createRouterInvokcation: string;
  rootRouterRelativePath: string;
  rootRouterName: string;
};
/**
 * Retrieves the file locations based on the configuration settings.
 *
 * @return {T3Deltas} The file locations object containing alias, trpcRootDir, createRouterInvokcation, rootRouterRelativePath, and rootRouterName.
 */
export const getFileLocations = (): T3Deltas => {
  const { t3 } = readConfigFile();
  const t3Locations: T3Deltas = {
    alias: "~",
    trpcRootDir: "server/api/",
    createRouterInvokcation: "createTRPCRouter",
    rootRouterRelativePath: "root.ts",
    rootRouterName: "root.ts",
  };
  const regularLocations: T3Deltas = {
    alias: "@",
    trpcRootDir: "lib/server/",
    createRouterInvokcation: "router",
    rootRouterRelativePath: "routers/_app.ts",
    rootRouterName: "_app.ts",
  };
  if (t3) return t3Locations;
  else return regularLocations;
};

type TAnalyticsEvent = "init_config" | "add_package" | "generate";
/**
 * Sends an analytics event to the specified URL.
 *
 * @param {TAnalyticsEvent} event - The type of analytics event to send.
 * @param {Record<any, any>} data - The data associated with the event.
 * @return {void} No return value.
 */
export const sendEvent = async (
  event: TAnalyticsEvent,
  data: Record<any, any>
) => {
  const config = readConfigFile();
  if (config.analytics === false) return;
  const url = "https://kirimase-proxy-analytics.vercel.app";
  // const url = "http://localhost:3000";
  try {
    await fetch(url + `/api/send-event`, {
      method: "POST",
      headers: {
        "x-request-from": "kirimase",
      },
      body: JSON.stringify({
        event,
        config,
        data,
      }),
    });
  } catch (e) {
    // do nothing
    // console.error(e);
    return;
  }
};
