// TypeScript type definitions for database entities

// Organization Interface
interface Organization {
    id: string;
    name: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
}

// Initiative Interface
interface Initiative {
    id: string;
    organizationId: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    updatedAt: Date;
}

// Signal Interface
interface Signal {
    id: string;
    initiativeId: string;
    type: string;
    value: number;
    createdAt: Date;
    updatedAt: Date;
}

// Diagnostic Interface
interface Diagnostic {
    id: string;
    signalId: string;
    analysis: string;
    createdAt: Date;
    updatedAt: Date;
}

// Advisory Interface
interface Advisory {
    id: string;
    diagnosticId: string;
    recommendation: string;
    createdAt: Date;
    updatedAt: Date;
}

// Dependency Interface
interface Dependency {
    id: string;
    initiativeId: string;
    dependencyId: string;
    createdAt: Date;
    updatedAt: Date;
}

// MaturityScore Interface
interface MaturityScore {
    id: string;
    organizationId: string;
    score: number;
    createdAt: Date;
    updatedAt: Date;
}

// PriorityScore Interface
interface PriorityScore {
    id: string;
    initiativeId: string;
    score: number;
    createdAt: Date;
    updatedAt: Date;
}

// Framework Interface
interface Framework {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

// KnowledgeBase Interface
interface KnowledgeBase {
    id: string;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

// Meeting Interface
interface Meeting {
    id: string;
    organizationId: string;
    date: Date;
    agenda: string;
    createdAt: Date;
    updatedAt: Date;
}

// ReportingSystem Interface
interface ReportingSystem {
    id: string;
    organizationId: string;
    reportType: string;
    createdAt: Date;
    updatedAt: Date;
}