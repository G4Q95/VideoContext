import GraphNode from "../graphnode";
import { IDefinition } from "../Definitions/definitions";
import RenderGraph from "../rendergraph";
declare const TYPE = "ProcessingNode";
declare class ProcessingNode extends GraphNode {
    _definition: IDefinition;
    _vertexShader: WebGLShader;
    _fragmentShader: WebGLShader;
    _properties: Record<any, any>;
    _shaderInputsTextureUnitMapping: Array<{
        name: string;
        textureUnit: number;
        textureUnitIndex: number;
        location: WebGLUniformLocation;
    }>;
    _maxTextureUnits: any;
    _boundTextureUnits: number;
    _texture: WebGLTexture;
    _program: WebGLProgram;
    _framebuffer: WebGLFramebuffer;
    _currentTimeLocation: WebGLUniformLocation | null;
    _currentTime: number;
    /**
     * Initialise an instance of a ProcessingNode.
     *
     * This class is not used directly, but is extended to create CompositingNodes, TransitionNodes, and EffectNodes.
     */
    constructor(gl: WebGL2RenderingContext, renderGraph: RenderGraph, definition: IDefinition, inputNames: string[], limitConnections: boolean);
    /**
     * Sets the passed processing node property to the passed value.
     * @param {string} name - The name of the processing node parameter to modify.
     * @param {Object} value - The value to set it to.
     *
     * @example
     * var ctx = new VideoContext();
     * var monoNode = ctx.effect(VideoContext.DEFINITIONS.MONOCHROME);
     * monoNode.setProperty("inputMix", [1.0,0.0,0.0]); //Just use red channel
     */
    setProperty(name: string, value: any): void;
    /**
     * Sets the passed processing node property to the passed value.
     * @param {string} name - The name of the processing node parameter to get.
     *
     * @example
     * var ctx = new VideoContext();
     * var monoNode = ctx.effect(VideoContext.DEFINITIONS.MONOCHROME);
     * console.log(monoNode.getProperty("inputMix")); //Will output [0.4,0.6,0.2], the default value from the effect definition.
     *
     */
    getProperty(name: string): any;
    /**
     * Destroy and clean-up the node.
     */
    destroy(): void;
    _update(currentTime: number): void;
    _seek(currentTime: number): void;
    _render(): void;
}
export { TYPE as PROCESSINGTYPE };
export default ProcessingNode;
