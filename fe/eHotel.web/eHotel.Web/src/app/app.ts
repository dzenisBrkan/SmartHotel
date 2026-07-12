import { AfterViewInit, Component, signal } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App implements AfterViewInit {
  protected readonly title = signal('eHotel.Web');
  private readonly apiBaseUrl =
    typeof window !== 'undefined' ? (window as any).API_BASE_URL || '' : '';

  ngAfterViewInit() {
    if (typeof document === 'undefined') {
      return;
    }
    this.setupModal();
    this.loadRooms();
  }

  private fetchJson(endpoint: string, options: RequestInit = {}) {
    const url = this.apiBaseUrl ? `${this.apiBaseUrl.replace(/\/$/, '')}${endpoint}` : endpoint;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3000);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => window.clearTimeout(timeout))
      .then(async (res) => {
        const txt = await res.text();
        if (!res.ok) {
          throw new Error(txt || res.statusText);
        }
        try {
          return JSON.parse(txt);
        } catch {
          return txt;
        }
      });
  }

  private setupModal() {
    const closeEl = document.getElementById('modal-close');
    const reserveEl = document.getElementById('modal-reserve');
    closeEl?.addEventListener('click', () => this.closeModal());
    reserveEl?.addEventListener('click', () => this.reserveFromModal());
  }

  private renderRooms(rooms: any[]) {
    const grid = document.getElementById('rooms-grid');
    if (!grid) {
      return;
    }

    grid.innerHTML = '';
    const defaultRoomImage =
      'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22%3E%3Crect width=%22800%22 height=%22600%22 fill=%22%23e2e8f0%22/%3E%3Cpath d=%22M200 450h400v-180h-100v-130h-200v130h-100z%22 fill=%22%23cbd5e1%22/%3E%3Ccircle cx=%22400%22 cy=%22380%22 r=%2228%22 fill=%22%23fff%22/%3E%3Ctext x=%22400%22 y=%22540%22 text-anchor=%22middle%22 font-family=%22Inter%2Csystem-ui%2Csans-serif%22 font-size=%2248%22 fill=%22%239ca3af%22%3ERoom image%3C/text%3E%3C/svg%3E';
    if (!rooms || rooms.length === 0) {
      const message = document.getElementById('landing-message');
      if (message) {
        message.textContent = 'No rooms available right now.';
      }
      return;
    }

    rooms.forEach((room) => {
      const card = document.createElement('article');
      card.className = 'room-card';
      card.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.closest('button')) {
          return;
        }
        this.openRoomPage(room);
      });
 
      const body = document.createElement('div');
      body.className = 'room-card-body';
 
      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'room-card-image';
 
      const image = document.createElement('img');
      image.className = 'room-image';
      image.alt = `Room image for ${room.naziv || room.name || 'Room'}`;
      image.src =
        room.slika ||
        room.image ||
        room.foto ||
        room.photo ||
        room.picture ||
        defaultRoomImage;
      image.onerror = () => {
        image.src = defaultRoomImage;
      };
      imageWrapper.appendChild(image);
 
      const header = document.createElement('div');
      header.className = 'room-card-header';
 
      const headerLeft = document.createElement('div');
      headerLeft.className = 'room-card-title-group';
 
      const title = document.createElement('h3');
      title.textContent = room.naziv || room.name || 'Room';
 
      const subtitle = document.createElement('p');
      subtitle.className = 'room-type';
      subtitle.textContent = room.tip || room.type || 'Guest room';
 
      headerLeft.appendChild(title);
      headerLeft.appendChild(subtitle);
 
      const roomPrice = room.cijena ?? room.price ?? '-';
      const priceTag = document.createElement('p');
      priceTag.className = 'room-price';
      priceTag.textContent = `${String(roomPrice).match(/[€$£]/) ? roomPrice : `${roomPrice} €`}`;
 
      const headerRight = document.createElement('div');
      headerRight.className = 'room-card-price-group';
      headerRight.appendChild(priceTag);
 
      header.appendChild(headerLeft);
      header.appendChild(headerRight);
 
      const desc = document.createElement('p');
      desc.className = 'room-description';
      desc.textContent = room.opis || room.description || 'No description available.';
 
      const meta = document.createElement('div');
      meta.className = 'room-meta';
 
      const capacityPill = document.createElement('span');
      capacityPill.className = 'room-meta-pill';
      capacityPill.textContent = `Capacity: ${room.kapacitet ?? room.capacity ?? '-'}`;
 
      meta.appendChild(capacityPill);
 
      const actions = document.createElement('div');
      actions.className = 'room-actions';
 
      const details = document.createElement('button');
      details.className = 'button secondary';
      details.textContent = 'More';
      details.addEventListener('click', (event) => {
        event.stopPropagation();
        this.openModal(room);
      });
 
      const reserve = document.createElement('button');
      reserve.className = 'button primary';
      reserve.textContent = 'Reserve';
      reserve.addEventListener('click', (event) => {
        event.stopPropagation();
        const query = new URLSearchParams({
          roomId: room.id ?? room.sobaId ?? room._id ?? ''
        }).toString();
        location.href = `/api-frontend/rezervacija-create.html?${query}`;
      });
 
      actions.appendChild(details);
      actions.appendChild(reserve);
 
      const footer = document.createElement('div');
      footer.className = 'room-card-footer';
      footer.appendChild(meta);
      footer.appendChild(actions);
 
      body.appendChild(imageWrapper);
      body.appendChild(header);
      body.appendChild(desc);
      body.appendChild(footer);
      card.appendChild(body);
      grid.appendChild(card);
    });
  }
 
  private openModal(room: any) {
      const modal = document.getElementById('room-modal');
      const title = document.getElementById('modal-title');
      const content = document.getElementById('modal-content');
      if (!modal || !title || !content) {
        return;
      }
 
      title.textContent = room.naziv || room.name || 'Room details';
      content.innerHTML = `
        <p><strong>Description:</strong> ${room.opis || room.description || '—'}</p>
        <p><strong>Capacity:</strong> ${room.kapacitet ?? room.capacity ?? '—'}</p>
        <p><strong>Price:</strong> ${room.cijena ?? room.price ?? '—'}</p>
      `;
      modal.dataset['room'] = JSON.stringify(room);
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
  }
 
  private openRoomPage(room: any) {
    const roomId = room.id ?? room.sobaId ?? room._id ?? '';
    if (!roomId) {
      return;
    }
    const query = new URLSearchParams({ roomId }).toString();
    location.href = `/api-frontend/room-details.html?${query}`;
  }

  private closeModal() {
    const modal = document.getElementById('room-modal');
    if (!modal) {
      return;
    }
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    delete modal.dataset['room'];
  }

  private reserveFromModal() {
    const modal = document.getElementById('room-modal');
    if (!modal || !modal.dataset['room']) {
      return;
    }
    const room = JSON.parse(modal.dataset['room']);
    const roomId = room.id ?? room.sobaId ?? room._id ?? '';
    const query = new URLSearchParams({ roomId }).toString();
    location.href = `/api-frontend/rezervacija-create.html?${query}`;
  }

  private renderFallbackRooms() {
    const fallbackRooms = [
      {
        id: '1',
        naziv: 'Standard Room',
        opis: 'A cozy room with a comfortable bed, desk, and private bathroom.',
        kapacitet: 2,
        cijena: '45€'
      },
      {
        id: '2',
        naziv: 'Deluxe Room',
        opis: 'A spacious room with additional seating, premium amenities, and a city view.',
        kapacitet: 3,
        cijena: '72€'
      },
      {
        id: '3',
        naziv: 'Family Suite',
        opis: 'Large suite with two rooms, ideal for families and longer stays.',
        kapacitet: 5,
        cijena: '110€'
      }
    ];
    this.renderRooms(fallbackRooms);
    const message = document.getElementById('landing-message');
    if (message) {
      message.textContent = 'Sample rooms shown because the backend is unavailable.';
    }
  }

  private logStatus(message: string) {
    console.debug(`[eHotel] ${message}`);
    const text = document.getElementById('landing-message');
    if (text) {
      text.textContent = message;
    }
  }

  private getRoomEndpoints() {
    const paths = ['/api/sobe', '/api/sobe/available', '/api/rooms', '/api/rooms/available'];
    const endpoints: string[] = [];

    if (this.apiBaseUrl) {
      const base = this.apiBaseUrl.replace(/\/$/, '');
      paths.forEach((path) => endpoints.push(`${base}${path}`));
    }

    paths.forEach((path) => endpoints.push(path));

    const ports = ['4000', '5000', '3000', '4200', '8080', '3001'];
    ports.forEach((port) => {
      paths.forEach((path) => endpoints.push(`http://localhost:${port}${path}`));
    });

    return [...new Set(endpoints)];
  }

  private async loadRooms() {
    this.logStatus('Loading rooms…');

    const endpoints = this.getRoomEndpoints();
    for (const endpoint of endpoints) {
      try {
        this.logStatus(`Trying room endpoint: ${endpoint}`);
        const result = await this.fetchJson(endpoint);
        if (Array.isArray(result)) {
          this.renderRooms(result);
          this.logStatus(`Loaded ${result.length} rooms from ${endpoint}.`);
          return;
        }
        this.logStatus(`Endpoint ${endpoint} returned unexpected data; trying next endpoint.`);
      } catch (error) {
        console.warn('[eHotel] Room fetch failed:', endpoint, error);
        this.logStatus(`Endpoint failed: ${endpoint}`);
      }
    }

    this.logStatus('No room endpoints responded. Showing sample rooms.');
    this.renderFallbackRooms();
  }
}
