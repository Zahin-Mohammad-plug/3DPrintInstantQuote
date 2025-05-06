<!-- TODO! -->
This is full of features suggestions, bug and improvements.


I am working on my 3d printing service website, this codebase has both the frontend and backend


Catalog page:
* Catalog photos are very low quality on front end
* Product page: Implement the share and save later

Product page
* Share and save page is currently unavailble; implement later

Upload page:
* .3mf files from makerWorld don't work.
* Allow .step files to be uploaded and quoted
* Allow oversize items with complex functionality:
    * inform user that this will require custom inquiry for this size of file.
    * Direct to contact page with file attached.


Customize page:
*Feat: ALlow ability to scale model
*BUG: When a special filament is selected, you can still pick a material even if not compatible.


Quote Page:
* Save quote and share are missing fucntionality, will integrate later; comment out for now


Cart Page:
* Should havbe a small preview image of the model / the product photo, this may require additional processing and new functions(possibly from backend) in order to create the thumbnail;
* Edit a already quoted item.

Checkout page:
* Fix the checkout page to actually email me and store in the backend. May require additonal backend process to do so.

Admin panel: 
* Pricing: 
    * Add ability to adjust time_cost.
    * Does support material even work?, if not, lets comment out for now
* Filaments:
        * Special Filaments arent selectable in materials, which means they don't respect material selection
* Catalog:
    * add logic to upload/update the 3d models.
    * Allow selectable available colors and Materials models.  
* Orders:
    * Be able to download the files uploaded when viewing order details

* Set file size and uploaded file types in admin. 


Future improvements
* Ensure original file is preserved.
* Ensure file is secure. 
* Use REACT instead so to mitigate hosting cost.
* Update for SEO.
* Ensure uses static export (use client).
