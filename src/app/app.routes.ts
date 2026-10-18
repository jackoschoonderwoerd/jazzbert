import { Routes } from '@angular/router';
import { PublicLayout } from './core/layout/public-layout/public-layout';
import { AdminLayout } from './core/layout/admin-layout/admin-layout';
import { LoginPage } from './core/auth/login-page/login.page';
import { AdminGuard } from './core/guards/admin.guard';
import { ConcertListPage } from './features/public/concerts/concert-list.page/concert-list.page';
import { ConcertDetailPage } from './features/public/concerts/concert-detail.page';
import { ArtistDetailPage } from './features/public/artists/artist-detail.page/artist-detail.page';
import { AdminArtistListPage } from './features/admin/artists/admin-artist-list.page';
import { AdminArtistEditPage } from './features/admin/artists/admin-artist-edit.page/admin-artist-edit.page';
import { AdminVenueListPage } from './features/admin/venues/admin-venue-list.page';
import { AdminVenueEditPage } from './features/admin/venues/admin-venue-edit.page/admin-venue-edit.page';
import { AdminConcertListPage } from './features/admin/concerts/admin-concert-list.page/admin-concert-list.page';
import { AdminConcertEditPage } from './features/admin/concerts/admin-concert-edit.page/admin-concert-edit.page';
import { AdminDashboardPage } from './features/admin/dashboard/admin-dashboard.page';
import { About } from './features/public/about/about';
import { JazzbertVisits } from './features/admin/jazzbert-visits/jazzbert-visits';
import { SendNotification } from './features/admin/send-notification/send-notification';


export const appRoutes: Routes = [
    {
        path: '',
        component: PublicLayout,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'about' },
            // { path: 'concerts', component: ConcertListPage },
            // { path: 'concerts/:id', component: ConcertDetailPage },
            { path: 'artists/:id', component: ArtistDetailPage },
            { path: 'about', component: About },
            {
                path: 'concerts',
                loadComponent: () => import('./features/public/concerts/concert-list.page/concert-list.page')
                    .then(c => c.ConcertListPage)
            },

            {
                path: 'concerts/:id',
                loadComponent: () => import('./features/public/concerts/concert-detail.page')
                    .then(c => c.ConcertDetailPage)
            },
            {
                path: 'contact',
                loadComponent: () => import('./features/public/contact/contact')
                    .then(c => c.Contact)
            }

        ],
    },
    {
        path: 'admin/login',
        component: LoginPage,
    },
    {
        path: 'admin',
        component: AdminLayout,
        canActivate: [AdminGuard],
        children: [
            { path: '', component: AdminDashboardPage },

            { path: 'artists', component: AdminArtistListPage },
            { path: 'artists/new', component: AdminArtistEditPage },
            { path: 'artists/:id', component: AdminArtistEditPage },

            { path: 'venues', component: AdminVenueListPage },
            { path: 'venues/new', component: AdminVenueEditPage },
            { path: 'venues/:id', component: AdminVenueEditPage },

            { path: 'concerts', component: AdminConcertListPage },
            { path: 'concerts/new', component: AdminConcertEditPage },
            { path: 'concerts/:id', component: AdminConcertEditPage },

            { path: 'jazzbert-visits', component: JazzbertVisits },
            { path: 'send-notification', component: SendNotification }
        ],
    },
    { path: '**', redirectTo: 'about' },
];
