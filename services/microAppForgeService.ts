
/**
 * @file services/microAppForgeService.ts
 * @description Provides mock data and definitions for the Micro-App Forge, such as available modules.
 */

import type { ModuleCategory } from '../types';

/**
 * Defines the categories and types of modules available in the Micro-App Forge toolbar.
 */
export const availableModuleCategories: ModuleCategory[] = [
    {
        name: 'System Ports (Weaver I/O)',
        modules: [
            {
                name: 'System Input',
                jacks: [
                    /* Fix: Added id field to Jack */
                    { id: 'sys-in-0', type: 'output', label: 'Data In' } // Data flows OUT of this node INTO the forge logic
                ],
            },
            {
                name: 'System Output',
                jacks: [
                    /* Fix: Added id field to Jack */
                    { id: 'sys-out-0', type: 'input', label: 'Result Out' } // Data flows INTO this node FROM the forge logic
                ],
            }
        ]
    },
    {
        name: 'Standard Instruments',
        modules: [
            {
                name: 'Micro-App Host',
                jacks: [
                    /* Fix: Added id field to Jack */
                    { id: 'host-in-0', type: 'input', label: 'Event In' },
                    { id: 'host-out-0', type: 'output', label: 'State Out' }
                ],
            },
            {
                name: 'Data Visualizer',
                jacks: [
                    /* Fix: Added id field to Jack */
                    { id: 'viz-in-0', type: 'input', label: 'JSON Data' }
                ],
            },
            {
                name: 'API Bridge',
                jacks: [
                    /* Fix: Added id field to Jack */
                    { id: 'bridge-in-0', type: 'input', label: 'Request' },
                    { id: 'bridge-out-0', type: 'output', label: 'Response' }
                ],
            },
            {
                name: 'Logic Processor',
                jacks: [
                    /* Fix: Added id field to Jack */
                    { id: 'logic-in-0', type: 'input', label: 'Input' },
                    { id: 'logic-out-0', type: 'output', label: 'Result' }
                ]
            }
        ]
    }
];
