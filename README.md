# ERB Snip Comment

A super-simple extension to toggle ERB comments or HTML comments in `.erb` files.

## Keyboard Shortcut
- **Mac**: `Cmd + /`
- **Windows/Linux**: `Ctrl + /`

## Use Cases

### 1. Single Line (No Highlight)
**ERB Tag**: Place cursor inside the ERB tag
```erb
<%= form.text_field :title %>  →  <%#= form.text_field :title %>
```

**HTML Tag**: Place cursor outside the html tag
```erb
<div class="container">  →  <%# <div class="container"> %>
```

### 2. Single ERB Tag (Multiline)
**Place cursor on the first line of the ERB tag**
```erb
<%= image_tag article.cover.attached? ? article.cover : "empty-cover.png", 
    alt: "Article cover", class: "article__cover margin-none", 
    style: "--cover-height: 60vh", data: { upload_preview_target: "image" } %>

→

<%#= image_tag article.cover.attached? ? article.cover : "empty-cover.png", 
    alt: "Article cover", class: "article__cover margin-none", 
    style: "--cover-height: 60vh", data: { upload_preview_target: "image" } %>
```

### 3. Multiple Lines (Mixed ERB and HTML)
**Highlight and comment**
```erb
<div class="flex align-center gap txt-medium">
  <%= translation_button(:book_title) %>
  <h1 class="txt-xx-large margin-none full-width">
    <%= form.text_field :title, required: true, autofocus: true %>
  </h1>
</div>

→

<%# <div class="flex align-center gap txt-medium"> %>
<%#= translation_button(:book_title) %>
<%# <h1 class="txt-xx-large margin-none full-width"> %>
<%#= form.text_field :title, required: true, autofocus: true %>
<%# </h1> %>
<%# </div> %>
```

### 4. Nested Multiline ERB Tags
**Comment the single multiline ERB tag separately**
```erb
<div class="form">
  <%= form_with model: @user, local: true, 
      html: { class: "user-form", data: { turbo: false } } do |f| %>
    <%= f.text_field :name %>
  <% end %>
</div>

→ (comment the multiline ERB tag separately)

<div class="form">
  <%#= form_with model: @user, local: true, 
      html: { class: "user-form", data: { turbo: false } } do |f| %>
    <%= f.text_field :name %>
  <% end %>
</div>
```
## Release Notes

### 1.0.0
- Initial release with basic toggling for single and multi-line `.erb` code.
