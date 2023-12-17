import { MonacoEditorLanguageClientWrapper } from './monaco-editor-wrapper/index.js';
import { buildWorkerDefinition } from "./monaco-editor-workers/index.js";
import monarchSyntax from "./syntaxes/robot-language.monarch.js";


buildWorkerDefinition('./monaco-editor-workers/workers', new URL('', window.location.href).href, false);

MonacoEditorLanguageClientWrapper.addMonacoStyles('monaco-editor-styles');

const client = new MonacoEditorLanguageClientWrapper();
const editorConfig = client.getEditorConfig();
editorConfig.setMainLanguageId('robot-language');

editorConfig.setMonarchTokensProvider(monarchSyntax);


editorConfig.theme = 'vs-dark';
editorConfig.useLanguageClient = true;
editorConfig.useWebSocket = false;

const workerURL = new URL('./robot-language-server-worker.js', import.meta.url);
console.log(workerURL.href);

const lsWorker = new Worker(workerURL.href, {
    type: 'classic',
    name: 'RobotLanguage Language Server'
});
client.setWorker(lsWorker);


let code = `let void entry () {
    var number count = 0
    loop count < 5
    {	
        setSpeed(500 * (count + 1))
        count = count + 1
        square(count)
    }
}

let void square(number factor){
    Forward 500 * factor
    Clock 90
    Forward 500 * factor
    Clock 90
    Forward 500 * factor
    Clock 90
    Forward 500 * factor
    Clock 90
}`

editorConfig.setMainCode(code);



editorConfig.theme = 'vs-dark';
editorConfig.useLanguageClient = true;
editorConfig.useWebSocket = false;

// keep a reference to a promise for when the editor is finished starting, we'll use this to setup the canvas on load
const startingPromise = client.startEditor(document.getElementById("monaco-editor-root"));
let module = null;
// setup the canvas when the editor is ready

const languageClient = client.getLanguageClient(); 

const max = (a, b) => {
    if (a > b) {
        return a;
    }
    return b;
}


const typecheck = (async () => {
    console.info('typechecking current code...');

    // To implement (Bonus)
    
    if (module.lexerErrors.length === 0 && 
        module.parserErrors.length === 0
    ) {
        const modal = document.getElementById("validModal");
        modal.style.display = "block";
    } else {
        const modal = document.getElementById("errorModal");
        modal.style.display = "block";
    }
});

const parseAndValidate = (async () => {
    console.info('validating current code...');
    // To implement
    
    client.getLanguageClient().sendNotification('browser/parseAndValidate', {
        content: client.getEditor().getModel().getValue(),
        uri: client.getEditor().getModel().uri.toString()
    });
});

const execute = (async () => {
    console.info('running 2 current code...');
    // To implement

    client.getLanguageClient().sendNotification('browser/execute', {
        content: client.getEditor().getModel().getValue(),
        uri: client.getEditor().getModel().uri.toString()
    });
});

const setupSimulator = (scene) => {
    const wideSide = max(scene.size.x, scene.size.y);
    let factor = 1000 / wideSide;

    window.scene = scene;
    console.log('scene');

    scene.entities.forEach((entity) => {
        if (entity.type === "Wall") {
            window.entities.push(new Wall(
                (entity.pos.x)*factor,
                (entity.pos.y)*factor,
                (entity.size.x)*factor,
                (entity.size.y)*factor
                ));
        }
        if (entity.type === "Block") {
            window.entities.push(new Wall(
                (entity.pos.x)*factor,
                (entity.pos.y)*factor,
                (entity.size.x)*factor,
                (entity.size.y)*factor
                ));
        }
    });

    window.p5robot = new Robot(
        factor,
        scene.robot.pos.x,
        scene.robot.pos.y,
        scene.robot.size.x * factor,
        scene.robot.size.y * factor,
        scene.robot.rad
    );
}

//setupSimulator(window.scene);
window.execute = execute;
window.typecheck = typecheck;
window.parseAndValidate = parseAndValidate;


var errorModal = document.getElementById("errorModal");
var validModal = document.getElementById("validModal");
var closeError = document.querySelector("#errorModal .close");
var closeValid = document.querySelector("#validModal .close");
closeError.onclick = function() {
    errorModal.style.display = "none";
}
closeValid.onclick = function() {
    validModal.style.display = "none";
}
window.onclick = function(event) {
    if (event.target == validModal) {
        validModal.style.display = "none";
    }
    if (event.target == errorModal) {
        errorModal.style.display = "none";
    }
  } 

/*
startingPromise.then(() => {
    setupSimulator();
})*/

client.getLanguageClient().onNotification('backend/execute', async (params) => {
    console.log(params);

    for (const action of params) {
        console.log(action.function);
        switch (action.function) {
            case 'Forward':
                await window.p5robot.move(action.distance);
                break;
            case 'Clock':
                window.p5robot.turn(Math.PI * action.distance / 180);
                break;
            case 'getTimestamp':
                window.p5robot.side(action.value);
                break;
            case 'setSpeed':
                window.p5robot.speed = action.value;
                break;
            case 'getDistance':
                window.p5robot.speed = action.value;
                break;
            default:
                console.log('Unknown action type: ' + action.type);
        }
        
        await new Promise(r => setTimeout(r, 500));
        draw();
    }
});

client.getLanguageClient().onNotification('backend/parseAndValidate', async (params) => {
    console.log(params);
    console.log('parseAndValidate');
    module = params;
    if (module.lexerErrors.length === 0 && 
        module.parserErrors.length === 0
    ) {
        const modal = document.getElementById("validModal");
        modal.style.display = "block";
    } else {
        const modal = document.getElementById("errorModal");
        modal.style.display = "block";
    }
});
