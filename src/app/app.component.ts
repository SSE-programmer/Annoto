import { Component, inject, OnInit, ViewContainerRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '@shared/components/header/header.component';
import { FooterComponent } from '@shared/components/footer/footer.component';
import { DynamicModalService } from '@shared/components/dynamic-modal/dynamic-modal.service';

@Component({
    selector: 'an-app-root',
    imports: [RouterOutlet, HeaderComponent, FooterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    private readonly dynamicModalService = inject(DynamicModalService);
    private readonly viewContainerRef = inject(ViewContainerRef);

    public ngOnInit() {
        this._setViewContainerRefs();
    }

    private _setViewContainerRefs(): void {
        this.dynamicModalService.setViewContainerRef(this.viewContainerRef);
    }
}
