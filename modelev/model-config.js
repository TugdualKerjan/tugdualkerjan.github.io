const modelConfig = {
    defaults: {
        spacing: 40,
        transitionDuration: "0.6s",
        borderRadius: "8px",
        borderWidth: "2px"
    },

    moduleTypes: {
        input: {
            defaultWidth: 120,
            defaultHeight: 80,
            background: "#bfdbfe"
        },
        processing: {
            defaultWidth: 100,
            defaultHeight: 60,
            background: "#fde68a"
        },
        transformer: {
            defaultWidth: 200,
            defaultHeight: 30,
            background: "#fecaca",
            stackable: true
        },
        output: {
            defaultWidth: 120,
            defaultHeight: 120,
            background: "#bbf7d0"
        },
        cnn: {
            defaultWidth: 150,
            defaultHeight: 60,
            background: "#a5b4fc"
        },
        embedding: {
            defaultWidth: 120,
            defaultHeight: 80,
            background: "#fbcfe8"
        },
        crossAttention: {
            defaultWidth: 180,
            defaultHeight: 60,
            background: "#bef264"
        },
        discriminator: {
            defaultWidth: 100,
            defaultHeight: 50,
            background: '#ffffff'
        },
    },

    stages: [
        // Stage 1: Basic Model (12 layers, hidden size 640)
        {
            name: "Basic Model (h=640, 12 layers)",
            modules: [
                {
                    id: "audio_input",
                    type: "input",
                    label: "Mel Spectrogram",
                    column: 0,
                    row: 0
                },
                {
                    id: "text_input",
                    type: "input",
                    label: "Text Input",
                    column: 0,
                    row: 1
                },
                {
                    id: "transformer",
                    type: "transformer",
                    label: "Transformer Stack (h=640)",
                    column: 1,
                    row: 0,
                    stackCount: 12,
                    stackSpread: 3
                },
                {
                    id: "output",
                    type: "output",
                    label: "HiFi-GAN",
                    column: 2,
                    row: 0
                }
            ],
            connections: [
                { from: "audio_input", to: "transformer" },
                { from: "text_input", to: "transformer" },
                { from: "transformer", to: "output" }
            ]
        },

        // Stage 2: Added Prenet
        {
            name: "Added Prenet",
            modules: [
                {
                    id: "audio_input",
                    type: "input",
                    label: "Mel Spectrogram",
                    column: 0,
                    row: 0
                },
                {
                    id: "text_input",
                    type: "input",
                    label: "Text Input",
                    column: 0,
                    row: 1
                },
                {
                    id: "prenet",
                    type: "processing",
                    label: "Prenet",
                    column: 1,
                    row: 0
                },
                {
                    id: "transformer",
                    type: "transformer",
                    label: "Transformer Stack (h=640)",
                    column: 2,
                    row: 0,
                    stackCount: 12,
                    stackSpread: 3
                },
                {
                    id: "output",
                    type: "output",
                    label: "HiFi-GAN",
                    column: 3,
                    row: 0
                }
            ],
            connections: [
                { from: "audio_input", to: "prenet" },
                { from: "text_input", to: "transformer" },
                { from: "prenet", to: "transformer" },
                { from: "transformer", to: "output" }
            ]
        },

        // Stage 3: Added Postnet
        {
            name: "Added Postnet",
            modules: [
                {
                    id: "audio_input",
                    type: "input",
                    label: "Mel Spectrogram",
                    column: 0,
                    row: 0
                },
                {
                    id: "text_input",
                    type: "input",
                    label: "Text Input",
                    column: 0,
                    row: 1
                },
                {
                    id: "prenet",
                    type: "processing",
                    label: "Prenet",
                    column: 1,
                    row: 0
                },
                {
                    id: "transformer",
                    type: "transformer",
                    label: "Transformer Stack (h=640)",
                    column: 2,
                    row: 0,
                    stackCount: 12,
                    stackSpread: 3
                },
                {
                    id: "postnet",
                    type: "processing",
                    label: "Postnet",
                    column: 3,
                    row: 0
                },
                {
                    id: "output",
                    type: "output",
                    label: "HiFi-GAN",
                    column: 4,
                    row: 0
                }
            ],
            connections: [
                { from: "audio_input", to: "prenet" },
                { from: "text_input", to: "transformer" },
                { from: "prenet", to: "transformer" },
                { from: "transformer", to: "postnet" },
                { from: "postnet", to: "output" }
            ]
        },

        // Stage 4: Added CNN after Postnet
        {
            name: "Added 5-layer CNN",
            modules: [
                {
                    id: "audio_input",
                    type: "input",
                    label: "Mel Spectrogram",
                    column: 0,
                    row: 0
                },
                {
                    id: "text_input",
                    type: "input",
                    label: "Text Input",
                    column: 0,
                    row: 1
                },
                {
                    id: "prenet",
                    type: "processing",
                    label: "Prenet",
                    column: 1,
                    row: 0
                },
                {
                    id: "transformer",
                    type: "transformer",
                    label: "Transformer Stack (h=640)",
                    column: 2,
                    row: 0,
                    stackCount: 12,
                    stackSpread: 3
                },
                {
                    id: "postnet",
                    type: "processing",
                    label: "Postnet",
                    column: 3,
                    row: 0
                },
                {
                    id: "cnn",
                    type: "cnn",
                    label: "5-layer CNN",
                    column: 4,
                    row: 0
                },
                {
                    id: "output",
                    type: "output",
                    label: "HiFi-GAN",
                    column: 5,
                    row: 0
                }
            ],
            connections: [
                { from: "audio_input", to: "prenet" },
                { from: "text_input", to: "transformer" },
                { from: "prenet", to: "transformer" },
                { from: "transformer", to: "postnet" },
                { from: "postnet", to: "cnn" },
                { from: "cnn", to: "output" }
            ]
        },

        // Stage 5: Changed hidden size and layers
        {
            name: "Modified Architecture (h=80, 16 layers)",
            modules: [
                {
                    id: "audio_input",
                    type: "input",
                    label: "Mel Spectrogram",
                    column: 0,
                    row: 0
                },
                {
                    id: "text_input",
                    type: "input",
                    label: "Text Input",
                    column: 0,
                    row: 1
                },
                {
                    id: "prenet",
                    type: "processing",
                    label: "Prenet",
                    column: 1,
                    row: 0
                },
                {
                    id: "transformer",
                    type: "transformer",
                    label: "Transformer Stack (h=80)",
                    column: 2,
                    row: 0,
                    stackCount: 16,
                    stackSpread: 3
                },
                {
                    id: "postnet",
                    type: "processing",
                    label: "Postnet",
                    column: 3,
                    row: 0
                },
                {
                    id: "cnn",
                    type: "cnn",
                    label: "5-layer CNN",
                    column: 4,
                    row: 0
                },
                {
                    id: "output",
                    type: "output",
                    label: "HiFi-GAN",
                    column: 5,
                    row: 0
                }
            ],
            connections: [
                { from: "audio_input", to: "prenet" },
                { from: "text_input", to: "transformer" },
                { from: "prenet", to: "transformer" },
                { from: "transformer", to: "postnet" },
                { from: "postnet", to: "cnn" },
                { from: "cnn", to: "output" }
            ]
        },

        // Stage 6: Added text with cross-attention (8 layers)
        {
            name: "Added Text Input (8 layers)",
            modules: [
                {
                    id: "audio_input",
                    type: "input",
                    label: "Audio Input",
                    column: 0,
                    row: 0
                },
                {
                    id: "text_input",
                    type: "input",
                    label: "Text Input",
                    column: 0,
                    row: 1
                },
                {
                    id: "prenet",
                    type: "processing",
                    label: "Prenet",
                    column: 1,
                    row: 0
                },
                {
                    id: "cross_attention",
                    type: "crossAttention",
                    label: "Cross-Attention",
                    column: 2,
                    row: 0
                },
                {
                    id: "transformer",
                    type: "transformer",
                    label: "Transformer Stack (h=80)",
                    column: 3,
                    row: 0,
                    stackCount: 8,
                    stackSpread: 3
                },
                {
                    id: "postnet",
                    type: "processing",
                    label: "Postnet",
                    column: 4,
                    row: 0
                },
                {
                    id: "cnn",
                    type: "cnn",
                    label: "5-layer CNN",
                    column: 5,
                    row: 0
                },
                {
                    id: "output",
                    type: "output",
                    label: "HiFi-GAN",
                    column: 6,
                    row: 0
                }
            ],
            connections: [
                { from: "audio_input", to: "prenet" },
                { from: "text_input", to: "cross_attention" },
                { from: "prenet", to: "cross_attention" },
                { from: "cross_attention", to: "transformer" },
                { from: "transformer", to: "postnet" },
                { from: "postnet", to: "cnn" },
                { from: "cnn", to: "output" }
            ]
        },

        // Stage 7: Removed Postnet and CNN
        {
            name: "Removed Postnet and CNN",
            modules: [
                {
                    id: "audio_input",
                    type: "input",
                    label: "Audio Input",
                    column: 0,
                    row: 0
                },
                {
                    id: "text_input",
                    type: "input",
                    label: "Text Input",
                    column: 0,
                    row: 1
                },
                {
                    id: "prenet",
                    type: "processing",
                    label: "Prenet",
                    column: 1,
                    row: 0
                },
                {
                    id: "cross_attention",
                    type: "crossAttention",
                    label: "Cross-Attention",
                    column: 2,
                    row: 0
                },
                {
                    id: "transformer",
                    type: "transformer",
                    label: "Transformer Stack (h=80)",
                    column: 3,
                    row: 0,
                    stackCount: 8,
                    stackSpread: 3
                },
                {
                    id: "output",
                    type: "output",
                    label: "HiFi-GAN",
                    column: 4,
                    row: 0
                }
            ],
            connections: [
                { from: "audio_input", to: "prenet" },
                { from: "text_input", to: "cross_attention" },
                { from: "prenet", to: "cross_attention" },
                { from: "cross_attention", to: "transformer" },
                { from: "transformer", to: "output" }
            ]
        },

        // Stage 8: Removed Prenet
        {
            name: "Removed Prenet",
            modules: [
                {
                    id: "audio_input",
                    type: "input",
                    label: "Audio Input",
                    column: 0,
                    row: 0
                },
                {
                    id: "text_input",
                    type: "input",
                    label: "Text Input",
                    column: 0,
                    row: 1
                },
                {
                    id: "cross_attention",
                    type: "crossAttention",
                    label: "Cross-Attention",
                    column: 1,
                    row: 0
                },
                {
                    id: "transformer",
                    type: "transformer",
                    label: "Transformer Stack (h=80)",
                    column: 2,
                    row: 0,
                    stackCount: 8,
                    stackSpread: 3
                },
                {
                    id: "output",
                    type: "output",
                    label: "HiFi-GAN",
                    column: 3,
                    row: 0
                }
            ],
            connections: [
                { from: "audio_input", to: "cross_attention" },
                { from: "text_input", to: "cross_attention" },
                { from: "cross_attention", to: "transformer" },
                { from: "transformer", to: "postnet" },
                { from: "postnet", to: "output" }
            ]
        },

        // Stage 10: Added CNN
        {
            name: "Added CNN",
            modules: [
                {
                    id: "audio_input",
                    type: "input",
                    label: "Audio Input",
                    column: 0,
                    row: 0
                },
                {
                    id: "text_input",
                    type: "input",
                    label: "Text Input",
                    column: 0,
                    row: 1
                },
                {
                    id: "cross_attention",
                    type: "crossAttention",
                    label: "Cross-Attention",
                    column: 1,
                    row: 0
                },
                {
                    id: "transformer",
                    type: "transformer",
                    label: "Transformer Stack (h=80)",
                    column: 2,
                    row: 0,
                    stackCount: 8,
                    stackSpread: 3
                },
                {
                    id: "postnet",
                    type: "processing",
                    label: "Postnet",
                    column: 3,
                    row: 0
                },
                {
                    id: "cnn",
                    type: "cnn",
                    label: "5-layer CNN",
                    column: 4,
                    row: 0
                },
                {
                    id: "output",
                    type: "output",
                    label: "HiFi-GAN",
                    column: 5,
                    row: 0
                }
            ],
            connections: [
                { from: "audio_input", to: "cross_attention" },
                { from: "text_input", to: "cross_attention" },
                { from: "cross_attention", to: "transformer" },
                { from: "transformer", to: "postnet" },
                { from: "postnet", to: "cnn" },
                { from: "cnn", to: "output" }
            ]
        },
        {
            name: "Added HiFi-GAN Discriminator",
            modules: [
                {
                    id: "audio_input",
                    type: "input",
                    label: "Mel Spectrogram",
                    column: 0,
                    row: 0
                },
                {
                    id: "text_input",
                    type: "input",
                    label: "Text Input",
                    column: 0,
                    row: 1
                },
                {
                    id: "cross_attention",
                    type: "crossAttention",
                    label: "Cross-Attention",
                    column: 1,
                    row: 0
                },
                {
                    id: "transformer",
                    type: "transformer",
                    label: "Transformer Stack (h=80)",
                    column: 2,
                    row: 0,
                    stackCount: 8,
                    stackSpread: 3
                },
                {
                    id: "postnet",
                    type: "processing",
                    label: "Postnet",
                    column: 3,
                    row: 0
                },
                {
                    id: "cnn",
                    type: "cnn",
                    label: "5-layer CNN",
                    column: 4,
                    row: 0
                },
                {
                    id: "output",
                    type: "output",
                    label: "HiFi-GAN",
                    column: 5,
                    row: 0
                },
                {
                    id: "discriminator",
                    type: "discriminator",
                    label: "MPD",
                    column: 5,
                    row: 1
                }
            ],
            connections: [
                { from: "audio_input", to: "cross_attention" },
                { from: "text_input", to: "cross_attention" },
                { from: "cross_attention", to: "transformer" },
                { from: "transformer", to: "postnet" },
                { from: "postnet", to: "cnn" },
                { from: "cnn", to: "output" },
                { from: "output", to: "discriminator" }
            ]
        },

        // Stage 12: Added Multi-Scale Discriminator
        {
            name: "Added Multi-Scale Discriminator",
            modules: [
                {
                    id: "audio_input",
                    type: "input",
                    label: "Mel Spectrogram",
                    column: 0,
                    row: 0
                },
                {
                    id: "text_input",
                    type: "input",
                    label: "Text Input",
                    column: 0,
                    row: 1
                },
                {
                    id: "cross_attention",
                    type: "crossAttention",
                    label: "Cross-Attention",
                    column: 1,
                    row: 0
                },
                {
                    id: "transformer",
                    type: "transformer",
                    label: "Transformer Stack (h=80)",
                    column: 2,
                    row: 0,
                    stackCount: 8,
                    stackSpread: 3
                },
                {
                    id: "postnet",
                    type: "processing",
                    label: "Postnet",
                    column: 3,
                    row: 0
                },
                {
                    id: "cnn",
                    type: "cnn",
                    label: "5-layer CNN",
                    column: 4,
                    row: 0
                },
                {
                    id: "output",
                    type: "output",
                    label: "HiFi-GAN",
                    column: 5,
                    row: 0
                },
                {
                    id: "discriminator1",
                    type: "discriminator",
                    label: "MPD",
                    column: 5,
                    row: 1
                },
                {
                    id: "discriminator2",
                    type: "discriminator",
                    label: "MSD",
                    column: 5,
                    row: 2
                }
            ],
            connections: [
                { from: "audio_input", to: "cross_attention" },
                { from: "text_input", to: "cross_attention" },
                { from: "cross_attention", to: "transformer" },
                { from: "transformer", to: "postnet" },
                { from: "postnet", to: "cnn" },
                { from: "cnn", to: "output" },
                { from: "output", to: "discriminator1" },
                { from: "output", to: "discriminator2" }
            ]
        },

        {
            name: "Added Skip Connections",
            modules: [
                {
                    id: "audio_input",
                    type: "input",
                    label: "Mel Spectrogram",
                    column: 0,
                    row: 0
                },
                {
                    id: "text_input",
                    type: "input",
                    label: "Text Input",
                    column: 0,
                    row: 1
                },
                {
                    id: "cross_attention",
                    type: "crossAttention",
                    label: "Cross-Attention",
                    column: 1,
                    row: 0
                },
                {
                    id: "transformer",
                    type: "transformer",
                    label: "Transformer Stack (h=80)",
                    column: 2,
                    row: 0,
                    stackCount: 8,
                    stackSpread: 3
                },
                {
                    id: "postnet",
                    type: "processing",
                    label: "Postnet",
                    column: 3,
                    row: 0
                },
                {
                    id: "cnn",
                    type: "cnn",
                    label: "5-layer CNN",
                    column: 4,
                    row: 0
                },
                {
                    id: "output",
                    type: "output",
                    label: "HiFi-GAN",
                    column: 5,
                    row: 0
                },
                {
                    id: "discriminator1",
                    type: "discriminator",
                    label: "MPD",
                    column: 5,
                    row: 1
                },
                {
                    id: "discriminator2",
                    type: "discriminator",
                    label: "MSD",
                    column: 5,
                    row: 2
                }
            ],
            connections: [
                { from: "audio_input", to: "cross_attention" },
                { from: "text_input", to: "cross_attention" },
                { from: "cross_attention", to: "transformer" },
                { from: "transformer", to: "postnet" },
                { from: "postnet", to: "cnn" },
                { from: "cnn", to: "output" },
                { from: "output", to: "discriminator1" },
                { from: "output", to: "discriminator2" },
                // Skip connections
                { from: "transformer", to: "cnn", type: "skip" },
                { from: "postnet", to: "output", type: "skip" }
            ]
        }
    ]
};

export default modelConfig;