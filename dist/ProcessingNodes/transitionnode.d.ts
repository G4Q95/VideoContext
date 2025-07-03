import { IDefinition } from "../Definitions/definitions";
import RenderGraph from "../rendergraph";
import EffectNode from "./effectnode";
declare const TYPE = "TransitionNode";
interface Transition {
    start: number;
    end: number;
    current: number;
    target: number;
    property: string;
}
declare class TransitionNode extends EffectNode {
    _transitions: Record<string, Transition[]>;
    _initialPropertyValues: Record<string, any>;
    /**
     * Initialise an instance of a TransitionNode. You should not instantiate this directly, but use VideoContest.createTransitonNode().
     */
    constructor(gl: WebGL2RenderingContext, renderGraph: RenderGraph, definition: IDefinition);
    _doesTransitionFitOnTimeline(testTransition: Transition): boolean;
    _insertTransitionInTimeline(transition: Transition): void;
    /**
     * Create a transition on the timeline.
     *
     * @param {number} startTime - The time at which the transition should start (relative to currentTime of video context).
     * @param {number} endTime - The time at which the transition should be completed by (relative to currentTime of video context).
     * @param {number} currentValue - The value to start the transition at.
     * @param {number} targetValue - The value to transition to by endTime.
     * @param {String} propertyName - The name of the property to clear transitions on, if undefined default to "mix".
     *
     * @return {Boolean} returns True if a transition is successfully added, false otherwise.
     */
    transition(startTime: number, endTime: number, currentValue: number, targetValue: number, propertyName?: string): boolean;
    /**
     * Create a transition on the timeline at an absolute time.
     *
     * @param {number} startTime - The time at which the transition should start (relative to time 0).
     * @param {number} endTime - The time at which the transition should be completed by (relative to time 0).
     * @param {number} currentValue - The value to start the transition at.
     * @param {number} targetValue - The value to transition to by endTime.
     * @param {String} propertyName - The name of the property to clear transitions on, if undefined default to "mix".
     *
     * @return {Boolean} returns True if a transition is successfully added, false otherwise.
     */
    transitionAt(startTime: number, endTime: number, currentValue: number, targetValue: number, propertyName?: string): boolean;
    /**
     * Clear all transistions on the passed property. If no property is defined clear all transitions on the node.
     *
     * @param {String} propertyName - The name of the property to clear transitions on, if undefined clear all transitions on the node.
     */
    clearTransitions(propertyName: string): void;
    /**
     * Clear a transistion on the passed property that the specified time lies within.
     *
     * @param {String} propertyName - The name of the property to clear a transition on.
     * @param {number} time - A time which lies within the property you're trying to clear.
     *
     * @return {Boolean} returns True if a transition is removed, false otherwise.
     */
    clearTransition(propertyName: string, time: number): boolean;
    _update(currentTime: number): void;
}
export { TYPE as TRANSITIONTYPE };
export default TransitionNode;
