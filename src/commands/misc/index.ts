import { consola } from "consola";
import { input, select } from "@inquirer/prompts";
import { createHelloFile } from "./hello-world/generators.js";

function provideInstructions() {
  consola.info("Quickly generate elements");
}
async function askForGenerate() {
  return (await select({
    message: "Please select the element you would like to generate:",
    choices: [
      { name: "Components", value: "component" },
      { name: "Hooks", value: "hooks" },
    ],
  }));
}

export async function generateSchema() {
  provideInstructions();
  const resourceType = await askForGenerate();
  if(resourceType == 'component') {
    const answer = await input({ message: 'Name of component:' , validate: (input) => input.match(/^(?:[a-z][a-z0-9]*(?:_[a-z0-9]+)*|[A-Z][a-zA-Z0-9]*)/)? true : "Component name must be in snake_case if more than one word, and plural."});
    createHelloFile(answer);
  }
}

