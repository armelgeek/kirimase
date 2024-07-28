import { formatFilePath, getFilePaths } from "../../../../dist/commands/filePaths/index.js";
import { existsSync } from "fs";
import { createFile } from "../../../../dist/utils.js";
import { consola } from "consola";

export const generateHelloWorldComponent = (answer:string) => {
    return `import React, { useState } from 'react';

interface ${answer}Props {
  initialMessage?: string;
}

const ${answer}: React.FC<${answer}Props> = ({ initialMessage = "Hello, World!" }) => {
  const [message, setMessage] = useState(initialMessage);

  const handleClick = () => {
    setMessage("You clicked the button!");
  };

  return (
    <div>
      <p>{message}</p>
      <button onClick={handleClick}>Click me</button>
    </div>
  );
};

export default ${answer};
`;
};
export const createHelloFile = (answer:string) => {
    const { shared } = getFilePaths();
    const filePath = shared.misc.element + '/' + `${answer}.tsx`;
    const layoutPath = formatFilePath(filePath, {
        prefix: "rootPath",
        removeExtension: false,
    });
    const layoutExists = existsSync(layoutPath);
    if (!layoutExists)
        createFile(layoutPath, generateHelloWorldComponent(answer));
    consola.success(
      `File generate: ${filePath}`
    );
};
