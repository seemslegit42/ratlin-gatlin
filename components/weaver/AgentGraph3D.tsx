
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { Agent, Connection } from '../../types';

interface AgentNodeProps {
    agent: Agent;
}

const AgentNode: React.FC<AgentNodeProps> = ({ agent }) => {
    // Basic representation: sphere for now
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh position={[agent.position.x / 100, -agent.position.y / 100, 0]}>
                <sphereGeometry args={[0.2, 32, 32]} />
                <meshStandardMaterial color={agent.status === 'Running' ? '#20B2AA' : '#6A0DAD'} />
            </mesh>
        </Float>
    );
};

interface AgentGraph3DProps {
    agents: Record<string, Agent>;
    connections: Connection[];
}

export const AgentGraph3D: React.FC<AgentGraph3DProps> = ({ agents, connections }) => {
    const lines = useMemo(() => {
        return connections.map(conn => {
            const fromAgent = agents[conn.from.agentId];
            const toAgent = agents[conn.to.agentId];
            if (!fromAgent || !toAgent) return null;
            
            return [
                new THREE.Vector3(fromAgent.position.x / 100, -fromAgent.position.y / 100, 0),
                new THREE.Vector3(toAgent.position.x / 100, -toAgent.position.y / 100, 0)
            ];
        }).filter(Boolean) as THREE.Vector3[][];
    }, [agents, connections]);

    return (
        <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            
            {Object.values(agents).map(agent => (
                <AgentNode key={agent.id} agent={agent} />
            ))}
            
            {lines.map((line, i) => (
                <Line key={i} points={line} color="#3EB991" lineWidth={2} />
            ))}
            
            <OrbitControls makeDefault />
        </Canvas>
    );
};
