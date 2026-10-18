import { Component, computed, signal } from '@angular/core';
import { Visit } from '../../../models/visit-model';
import { VisitsRepository } from '../../../data-access/visits.repository';
import { DatePipe, JsonPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
    selector: 'app-jazzbert-visits',
    imports: [DatePipe, MatIconModule, MatButtonModule],
    templateUrl: './jazzbert-visits.html',
    styleUrl: './jazzbert-visits.scss',
})
export class JazzbertVisits {
    readonly loading = signal(true);
    readonly visits = signal<Visit[]>([]);

    readonly groupedVisits = computed(() => {
        const groups: Record<string, Visit[]> = {};

        const sorted = [...this.visits()].sort(
            (a, b) => b.visitedAt.toMillis() - a.visitedAt.toMillis()
        );

        for (const visit of sorted) {
            const dateKey = visit.visitedAt.toDate().toLocaleDateString(
                'en-GB',
                {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                }
            );

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }

            groups[dateKey].push(visit);
        }

        return Object.entries(groups);
    });

    constructor(
        private visitsRepository: VisitsRepository
    ) {
        void this.load()
    }

    private async load() {
        try {
            const visits = await this.visitsRepository.getAll();
            this.visits.set(
                [...visits].sort(
                    (a, b) => b.visitedAt.toMillis() - a.visitedAt.toMillis(),
                )
            )
        } catch (error) {
            console.log(error)
        } finally {
            this.loading.set(false);
        }
    }
    async onDelete(id: string) {
        await this.visitsRepository.delete(id);

        this.visits.update((visits) =>
            visits.filter((visit) => visit.id !== id)
        );
    }
}
