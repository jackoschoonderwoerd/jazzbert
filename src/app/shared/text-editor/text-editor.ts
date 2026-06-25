import {
    AfterViewInit,
    Component,
    ElementRef,
    forwardRef,
    input,
    OnDestroy,
    signal,
    viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor } from '@tiptap/core';
import TextAlign from '@tiptap/extension-text-align';
import StarterKit from '@tiptap/starter-kit';

@Component({
    selector: 'app-text-editor',
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextEditor),
            multi: true,
        },
    ],
    templateUrl: './text-editor.html',
    styleUrls: [`./text-editor.scss`]
})
export class TextEditor implements ControlValueAccessor, AfterViewInit, OnDestroy {
    readonly placeholder = input<string>('');
    readonly editorHost = viewChild.required<ElementRef<HTMLDivElement>>('editorHost');

    readonly disabled = signal(false);

    private editor: Editor | null = null;
    private currentHtml = '';

    private onChange: (value: string) => void = () => { };
    private onTouched: () => void = () => { };

    ngAfterViewInit(): void {
        this.editor = new Editor({
            element: this.editorHost().nativeElement,
            extensions: [
                StarterKit,
                TextAlign.configure({
                    types: ['heading', 'paragraph'], // what can be aligned
                }),
            ],
            content: this.currentHtml,
            editable: !this.disabled(),
            onUpdate: ({ editor }) => {
                const html = editor.getHTML();
                this.currentHtml = html;
                this.onChange(html);
            },
            onBlur: () => {
                this.onTouched();
            },
        });
    }

    ngOnDestroy(): void {
        this.editor?.destroy();
    }

    writeValue(value: string | null): void {
        this.currentHtml = value?.trim() || '<p></p>';

        if (this.editor) {
            this.editor.commands.setContent(this.currentHtml, { emitUpdate: false });
        }
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled.set(isDisabled);
        this.editor?.setEditable(!isDisabled);
    }

    toggleBold(): void {
        this.editor?.chain().focus().toggleBold().run();
    }

    toggleItalic(): void {
        this.editor?.chain().focus().toggleItalic().run();
    }

    toggleBulletList(): void {
        this.editor?.chain().focus().toggleBulletList().run();
    }

    toggleOrderedList(): void {
        this.editor?.chain().focus().toggleOrderedList().run();
    }

    setParagraph(): void {
        this.editor?.chain().focus().setParagraph().run();
    }

    toggleHeading(level: 2 | 3): void {
        this.editor?.chain().focus().toggleHeading({ level }).run();
    }

    undo(): void {
        this.editor?.chain().focus().undo().run();
    }

    redo(): void {
        this.editor?.chain().focus().redo().run();
    }

    setAlignCenter(): void {
        this.editor?.chain().focus().setTextAlign('center').run();
    }
}
