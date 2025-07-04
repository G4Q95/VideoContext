export interface IDefinition {
    title?: string;
    description?: string;
    vertexShader: string;
    fragmentShader: string;
    properties: {
        [key: string]: {
            type: string;
            value: any;
        };
    };
    inputs: string[];
}
declare let DEFINITIONS: {
    AAF_VIDEO_SCALE: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            scaleX: {
                type: string;
                value: number;
            };
            scaleY: {
                type: string;
                value: number;
            };
            bColor: {
                type: string;
                value: number[];
            };
        };
        inputs: string[];
    };
    CROSSFADE: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            mix: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    DREAMFADE: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            mix: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    HORIZONTAL_WIPE: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            mix: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    VERTICAL_WIPE: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            mix: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    RANDOM_DISSOLVE: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            mix: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    STATIC_DISSOLVE: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            mix: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    STATIC_EFFECT: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            weight: {
                type: string;
                value: number[];
            };
            amount: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    TO_COLOR_AND_BACK: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            mix: {
                type: string;
                value: number;
            };
            color: {
                type: string;
                value: number[];
            };
        };
        inputs: string[];
    };
    STAR_WIPE: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            mix: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    COMBINE: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            a: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    COLORTHRESHOLD: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            a: {
                type: string;
                value: number;
            };
            colorAlphaThreshold: {
                type: string;
                value: number[];
            };
        };
        inputs: string[];
    };
    MONOCHROME: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            inputMix: {
                type: string;
                value: number[];
            };
            outputMix: {
                type: string;
                value: number[];
            };
        };
        inputs: string[];
    };
    HORIZONTAL_BLUR: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            blurAmount: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    VERTICAL_BLUR: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            blurAmount: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    AAF_VIDEO_CROP: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            cropLeft: {
                type: string;
                value: number;
            };
            cropRight: {
                type: string;
                value: number;
            };
            cropTop: {
                type: string;
                value: number;
            };
            cropBottom: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    AAF_VIDEO_POSITION: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            positionOffsetX: {
                type: string;
                value: number;
            };
            positionOffsetY: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    AAF_VIDEO_FLIP: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {};
        inputs: string[];
    };
    AAF_VIDEO_FLOP: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {};
        inputs: string[];
    };
    OPACITY: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            opacity: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
    CROP: {
        title: string;
        description: string;
        vertexShader: string;
        fragmentShader: string;
        properties: {
            x: {
                type: string;
                value: number;
            };
            y: {
                type: string;
                value: number;
            };
            width: {
                type: string;
                value: number;
            };
            height: {
                type: string;
                value: number;
            };
        };
        inputs: string[];
    };
};
export default DEFINITIONS;
